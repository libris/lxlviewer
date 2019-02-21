<script>
import { mapGetters } from 'vuex';
import { each } from 'lodash-es';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'holding-list',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  components: {
    'vue-simple-spinner': VueSimpleSpinner,
  },
  data() {
    return {
      selected: [],
    };
  },
  computed: {
    ...mapGetters([
      'directoryCare',
      'settings',
    ]),
    isSender() {
      return this.name === 'sender';
    },
    bothSelected() {
      return (this.directoryCare.sender !== null && this.directoryCare.reciever !== null);
    },
  },
  watch: {
    selected(value) {
      const changeObj = { ['selectedHoldings']: value };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
    },
    'directoryCare.sender'() {
      if (this.name === 'sender') {
        this.getHoldings();
      }
      this.clearSelected();
    },
    'directoryCare.reciever'() {
      if (this.name === 'reciever') {
        this.getHoldings();
      }
      this.clearSelected();
    },
  },
  methods: {
    isSelected(holding) {
      return this.selected.indexOf(holding['@id']) > -1;
    },
    handleCheckbox($event, holding) {
      if ($event.target.checked === true) {
        this.selected.push(holding['@id']);
      } else {
        for (let i = 0; i < this.selected.length; i++) {
          if (this.selected[i] === holding['@id']) {
            this.selected.splice(i, 1);
          }
        }
      }
    },
    holdingExistsOnTarget(holdingObj) {
      const sigel = holdingObj.heldBy['@id'];
      const recieverHoldings = this.directoryCare.recieverHoldings;
      for (let i = 0; i < recieverHoldings.length; i++) {
        if (recieverHoldings[i].heldBy['@id'] === sigel) {
          return true;
        }
      }
      return false;
    },
    clearSelected() {
      this.selected = [];
    },
    getHoldings() {
      const self = this;
      const bibId = this.directoryCare[this.name];
      const queryPairs = {
        'itemOf.@id': bibId,
        '@type': 'Item',
      };
      let url = `${this.settings.apiPath}/find.json?`;
      each(queryPairs, (v, k) => {
        url += (`${encodeURIComponent(k)}=${encodeURIComponent(v)}&`);
      });
      fetch(url).then(response => response.json()).then((result) => {
        const changeObj = { [`${this.name}Holdings`]: result.items };
        self.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
      }, (error) => {
        console.warn('Couldnt find holdongs for', bibId, error);
      });
    },
  },
  mounted() {
  },

};
</script>

<template>
  <div class="HoldingList">
    <div class="HoldingList-item" :key="index" v-for="(holding, index) in directoryCare[`${this.name}Holdings`]">
      <div class="HoldingList-inputAndLoading" v-if="isSender">
        <input v-if="!holdingExistsOnTarget(holding) && bothSelected" :checked="isSelected(holding)" type="checkbox" @change="handleCheckbox($event, holding)" />
        <input v-if="holdingExistsOnTarget(holding) || !bothSelected" :checked="isSelected(holding)" type="checkbox" disabled />
      </div>
      <div class="HoldingList-itemInfo">
        {{ holding.heldBy['@id'] | removeDomain }} <span v-if="isSender && holdingExistsOnTarget(holding)" class="badge">{{ 'Already exists' | translatePhrase }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.HoldingList {
  flex-basis: @directorycare-sidewidth: 48%;;
  padding: 20px;
  &-item {
    flex-basis: @directorycare-sidewidth: 48%;;
    display: flex;
    flex-direction: row;
    border: 1px solid @grey-light;
  }
  &-itemInfo {
    padding: 1em;
  }
  &-inputAndLoading {
    display: flex;
    flex-direction: row;
    width: 10%;
    justify-content: center;
    align-items: center;
    input {
      margin: 0;
    }
  }
}

</style>
