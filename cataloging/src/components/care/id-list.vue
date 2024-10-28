<script>
import {convertResourceLink, translatePhrase} from "../../utils/filters.js";

export default {
  name: 'id-list.vue',
  data() {
    return {
    };
  },
  props: {
    idListLink: {
      type: String,
      default: ''
    },
    showRemoveButton: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
  },
  emits: ['removeIdList'],
  methods: {
    convertResourceLink,
    translatePhrase,
    removeIdList() {
      this.$emit('removeIdList');
    }
  },
};
</script>
<template>
  <div class="IdList-idLabel">
    {{translatePhrase("Selection from ID list")}}
  </div>
  <div class="IdList-idList">
    <a class="IdList-link" :href="convertResourceLink(this.idListLink)" target="_blank">{{this.idListLink}}</a>
    <i v-if="showRemoveButton"
      @click="removeIdList"
      role="button"
      tabindex="0"
      class="IdList-closeButton fa fa-close icon--md" />
  </div>
</template>

<style scoped lang="less">
.IdList {
  &-idList {
    align-items: center;
    display: flex;
    border: 1px solid @grey-lighter;
    margin-bottom: 20px;
    width: 100%;
  }

  &-idLabel {
    width: fit-content;
    font-size: 12px;
    padding-bottom: 4px;
  }

  &-link {
    padding: 10px 20px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-closeButton {
    padding-right: 20px;
  }
}
</style>
