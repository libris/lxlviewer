<script>
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';
import { mapGetters } from 'vuex';

export default {
  name: 'id-pill',
  props: {
    uri: {
      type: String,
      default: '',
    },
    isLibrisResource: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      idHover: false,
      recentlyCopiedId: false,
      failedCopyId: false,
    };
  },
  methods: {
    copyFnurgel() {
      const self = this;
      this.$copyText(this.uri).then(() => {
        self.recentlyCopiedId = true;
        setTimeout(() => {
          self.recentlyCopiedId = false;
        }, 1000);
      }, (e) => {
        self.failedCopyId = true;
        console.warn(e);
      });
    },
  },
  computed: {
    ...mapGetters([
      'user',
      'resources',
    ]),
    idAsFnurgel() {
      if (this.uri) {
        const id = this.uri;
        const fnurgel = RecordUtil.extractFnurgel(id);
        if (fnurgel && this.isLibrisResource) {
          return fnurgel;
        }
        const cleaned = id.replace('https://', '').replace('http://', '');
        return cleaned;
      }
      return null;
    },
    idTooltipText() {
      return StringUtil.getUiPhraseByLang('Copy ID', this.user.settings.language, this.resources.i18n);
    },
  },
};
</script>

<template>
  <div
    v-if="idAsFnurgel"
    class="IdPill"
    :class="{ 'recently-copied': recentlyCopiedId }"
    @mouseover="idHover = true"
    @mouseout="idHover = false">
    <i
      v-tooltip.top="idTooltipText"
      class="fa fa-copy IdPill-idCopyIcon"
      :class="{ collapsedIcon: !idHover || recentlyCopiedId }"
      @click.stop="copyFnurgel" />{{ idAsFnurgel }}
  </div>
</template>

<style lang="less">
.IdPill {
  flex-grow: 0;
  text-align: right;
  text-transform: none;
  color: @grey-very-dark-transparent;
  background-color: @badge-color-transparent;
  transition: background-color 0.5s ease;
  letter-spacing: 0.5px;
  font-size: 1.2rem;
  font-weight: 400;
  padding: 0 0.75em;
  border-radius: 1em;

  &.recently-copied {
    background-color: @brand-success;
    color: @white;
  }
  &-idCopyIcon {
    transition: all 0.25s ease;
    margin: 0 0.25em 0 -0.25em;
    overflow: hidden;
    width: 1.2em;
    opacity: 1;
    cursor: pointer;
    &.collapsedIcon {
      margin: 0 0 0 0;
      width: 0;
      opacity: 0;
    }
  }
}
</style>
