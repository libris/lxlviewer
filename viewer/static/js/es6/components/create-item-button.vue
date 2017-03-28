<script>
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';
import * as DisplayUtil from '../utils/display';
import * as StringUtil from '../utils/string';

export default {
  name: 'create-item-button',
  props: {
  },
  data() {
    return {
      itemData: {},
    }
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
    },
  },
  methods: {
    buildItem() {
      const embellishedReference = DisplayUtil.getCard(this.editorData.it, this.display, this.editorData.linked, this.vocab, this.settings);
      embellishedReference['@id'] = this.editorData.it['@id'];

      this.itemData = {
        '@graph': [
          {
            '@type': 'Record',
            'mainEntity': {
              '@id': '_:TEMP_ID',
            },
          },
          {
            '@id': '_:TEMP_ID',
            '@type': 'Item',
            'itemOf': {
              '@id': this.editorData.it['@id'],
            },
            'heldBy': {
              '@id': `https://libris.kb.se/library/${this.settings.userInfo.sigel}`,
            },
          },
          {
            '@graph': [
              embellishedReference,
            ],
          },
        ],
      };
    },
  },
  computed: {
  },
  components: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.buildItem();
    });
  },
};
</script>

<template>
  <div>
    <form method="POST" action="/edit">
      <textarea id="copyItem" name="item" class="hidden">{{itemData | json}}</textarea>
      <button type="submit"><i class="fa fa-plus"></i> Bestånd</button>
    </form>
  </div>
</template>

<style lang="less">
@import './_variables.less';

</style>
