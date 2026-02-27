<template>
  <li class="TermTreeItem" :class="{ TermTreeRootItem: level === 1 }">
    <details
      v-if="this.narrower?.length > 0"
      class="TermTreeItem-group"
      :style="{ '--level': level }"
      :open="this.open"
    >
      <summary
        class="TermTreeItem-content"
        :id="this.hashId"
        :class="{ target: this.hashId === $nuxt.$route.hash.replace('#', '') }"
      >
        <div class="TermTreeItem-group-icon">
          <i class="bi bi-chevron-right"></i>
        </div>
        <TermTreeItemLabel :@id="this['@id']" :label="this.label" />
      </summary>
      <ul class="TermTreeItem-list">
        <TermTreeItem
          v-for="childItem in this.narrower"
          :key="childItem['@id']"
          :@id="childItem['@id']"
          :code="childItem.code"
          :label="childItem.label"
          :narrower="childItem.narrower"
          :level="level + 1"
        />
      </ul>
    </details>
    <div v-else class="TermTreeItem-content" :id="this.hashId">
      <div class="TermTreeItem-group-icon">
        <!-- fill same width as chevron -->
      </div>
      <TermTreeItemLabel :@id="this['@id']" :label="this.label" />
    </div>
  </li>
</template>

<script>
import { mapGetters } from "vuex";
import LensMixin from "@/mixins/lens";
import TermTreeItemLabel from "./TermTreeItemLabel.vue";

export default {
  mixins: [LensMixin],
  name: "TermTreeItem",
  data() {
    return {};
  },
  props: {
    "@id": String,
    code: String,
    label: String,
    narrower: Array,
    level: {
      type: Number,
      default: 1,
    },
  },
  components: {
    TermTreeItemLabel,
  },
  computed: {
    ...mapGetters([
      "vocab",
      "vocabContext",
      "resources",
      "settings",
      "appState",
    ]),
    hashId() {
      return encodeURI(this["@id"].split("/").pop());
    },
    open() {
      if (this.$nuxt.$route.hash.replace("#", "") === this.hashId) {
        return true;
      }
      if (this.narrower) {
        const hasNarrowerWithHash = (narrower) => {
          return narrower.find((item) => {
            if (
              encodeURI(item["@id"].split("/").pop()) ===
              this.$nuxt.$route.hash.replace("#", "")
            ) {
              return true;
            }
            if (item.narrower) {
              return hasNarrowerWithHash(item.narrower);
            }
          });
        };
        return hasNarrowerWithHash(this.narrower) ? true : undefined;
      }
    },
  },
  methods: {},
};
</script>

<style lang="scss">
.total-term-items {
  color: $gray-700;
}

.TermTreeItem {
  &-group {
    position: relative;

    & > summary {
      &::-webkit-details-marker {
        display: none;
      }

      &:focus-within .TermTreeItemLabel-anchor {
        display: inline-flex;
      }
    }

    &[open] {
      background: $white;

      & > summary {
        background: $white;
      }
    }
    & > ul {
      padding-left: 32px;
    }

    &-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 16px;
      margin-left: 8px;
    }
    &[open] > summary > .TermTreeItem-group-icon .bi-chevron-right {
      transform: rotate(90deg);
    }
  }

  &-list {
    list-style-type: none;
    padding: 0;
  }

  & h5 {
    font-size: var(--bs-body-font-size);
    font-weight: normal;
    margin: 0;
    padding: 1em 0.5em;
  }

  & a {
    color: $kb-secondary-turquoise;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}

.TermTreeItem-content {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  &:target {
    scroll-margin-top: 160px;
  }

  &:target,
  &.target {
    background: rgba($kb-secondary-turquoise, 0.1) !important;
  }

  &summary:hover {
    @media (min-width: 768px) {
      position: relative;
      background-color: $white;
      z-index: 500 !important;
      background-color: $white;
      box-shadow: 0 0.15em 0.25em 0 rgba(0, 0, 0, 0.25);
    }
  }
}

.TermTreeRootItem {
  background-color: $gray-100;
  border: solid $gray-200;
  border-width: 1px 1px 1px 1px;
}
</style>
