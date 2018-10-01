<script>
import EntitySummary from '../shared/entity-summary';
import PanelComponent from '@/components/shared/panel-component';
import * as StringUtil from '@/utils/string';
import * as RecordUtil from '@/utils/record';
import * as LayoutUtil from '@/utils/layout';
import * as HttpUtil from '@/utils/http';
import { mapGetters } from 'vuex';

export default {
  name: 'relations-list',
  props: {
    relationsList: {
      type: Array,
      default: () => [],
    },
    listContextType: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      itemData: {},
      embellishedList: [],
      showInstances: false,
    }
  },
  methods: {
    buildEmbellishedInstanceList(instanceList) {
      // const promiseArray = instanceList.map(instanceId => {
      //   return HttpUtil.get({ url: `${instanceId}/data.jsonld`, contentType: 'text/plain' }).then(instanceInfo => {
      //     return RecordUtil.splitJson(instanceInfo);
      //   }, (error) => {
      //     console.log("Error fetching relation info");
      //   });
      // });
      // Promise.all(promiseArray).then(results => {
      //   this.embellishedList = results;
      //   this.loading = false;
      //   // this.$store.dispatch('setStatusValue', { 
      //   //   property: 'keybindState', 
      //   //   value: 'show-instances-list'
      //   // });
      // });
    },
    hide() {
      this.$emit('close');
      // this.$store.dispatch('setStatusValue', { 
      //   property: 'keybindState', 
      //   value: 'overview'
      // });
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    windowTitle() {
      if (this.listContextType === 'Item') {
        return StringUtil.getUiPhraseByLang('All holdings');
      } else if (this.listContextType === 'Work') {
        return StringUtil.getUiPhraseByLang('Instantiations of this work', this.settings.language);
      } else if (this.listContextType === 'Instance') {
        return StringUtil.getUiPhraseByLang('Holdings of this instance', this.settings.language);
      }
      return '';
    }
  },
  components: {
    'entity-summary': EntitySummary,
    'panel-component': PanelComponent,
  },
  watch: {
    'inspector.event'(val, oldVal) {
      if (val.name === 'form-control') {
        switch (val.value) { 
          case 'close-modals':
            this.hide();
            break;
          default:
            return;
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.buildEmbellishedInstanceList(this.relationsList);
    });
  },
};
</script>

<template>
  <div class="RelationsList">
    <panel-component :title="windowTitle" @close="hide()">
      <template slot="panel-body">
        <ul>
          <li v-for="item in relationsList" :key="item['@id']">
            <entity-summary  
              :focus-data="item" 
              :add-link="true" 
              :lines="4"></entity-summary>
          </li>
        </ul>
      </template>
    </panel-component>
  </div>
</template>

<style lang="less">

.RelationsList {
  &-body {
    width: 100%;
    background-color: white;
    border: 1px solid #ccc;
    padding: 0px;
    overflow-y: scroll;
    .entity-summary {
      &:hover {
        background: darken(@white, 5%);
        cursor: pointer;
        .header {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
