<script>
import * as DisplayUtil from '@/utils/display';
import * as StringUtil from '@/utils/string';
import * as RecordUtil from '@/utils/record';
import * as DataUtil from '@/utils/data';
import * as HttpUtil from '@/utils/http';
import { mapGetters } from 'vuex';
import Modernizr from '@/../.modernizrrc.js';

export default {
  name: 'create-item-button',
  props: {
    hasHolding: false,
    checkingHolding: true,
    holdingId: '',
    disabled: false,
  },
  data() {
    return {
      itemData: {},
    }
  },
  events: {
  },
  methods: {
    buildItem() {
      const embellishedReference = DisplayUtil.getCard(
        this.inspector.data.mainEntity, 
        this.resources.display, 
        this.inspector.data.quoted, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context);
      embellishedReference['@id'] = this.inspector.data.mainEntity['@id'];

      this.itemData = RecordUtil.getItemObject(
        this.inspector.data.mainEntity['@id'],
        `https://libris.kb.se/library/${this.user.settings.activeSigel}`,
        embellishedReference
      );

      this.$emit('done');
    },
    gotoHolding() {
      const locationParts = this.holdingId[0].split('/');
      const fnurgel = locationParts[locationParts.length-1];
      this.$router.push({ path: `/${fnurgel}` });
    },
    previewHolding() {
      this.$store.dispatch('setInsertData', DataUtil.getMergedItems(this.itemData.record, this.itemData.mainEntity, null, this.itemData.quoted));
      this.$router.push({ path: '/new' });
    }
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
  },
  components: {
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.buildItem();
    });
  },
};
</script>

<template>
  <div class="CreateItem create-item-button-container">
    <!--<form method="POST" action="/edit">-->
      <!--<textarea id="copyItem" name="data" class="hidden">{{itemData | json}}</textarea>-->
      <button class="btn btn-default CreateItem-btn"
        v-if="!hasHolding || checkingHolding" 
        @click="previewHolding()" 
        :disabled="disabled" 
        :class=" {'is-disabled': disabled} ">
        <i class="fa fa-plus"
          v-if="!hasHolding && !checkingHolding"></i>
        <i class="fa fa-fw fa-circle-o-notch fa-spin"
          v-if="checkingHolding"></i>
        {{"Add holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
      <button class="btn btn-default CreateItem-btn"
        v-if="hasHolding" 
        :class="{'CreateItem-btn--hasHolding': hasHolding, 'is-disabled': disabled}"  
        :disabled="disabled" 
        @click.prevent="gotoHolding()">
        <i class="fa fa-check"
          v-if="hasHolding && !checkingHolding"></i>
        {{"Show holding" | translatePhrase}}
        <span>({{user.settings.activeSigel}})</span>
      </button>
    <!--</form>-->
  </div>
</template>

<style lang="less">

.CreateItem {
  &-btn {
    font-weight: 700;

    &--hasHolding {
      background: @sec;
      border-color: @sec-contrast;
      color: @white;

      &:hover {
        background: @sec-alter;
        border-color: @sec-alter-contrast;
        color: @white;
      }
    }
  }
}

</style>
