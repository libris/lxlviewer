<template>
  <li class="TermTreeItem" :class="{ TermTreeRootItem: level === 1 }">
    <details
      v-if="this.narrower?.length > 0"
      class="TermTreeItem-group"
      :style="{ '--level': level }"
    >
      <summary class="TermTreeItem-label" :id="this['@id'].split('/').pop()">
        <div class="TermTreeItem-group-icon">
          <i class="bi bi-chevron-right"></i>
        </div>
        <h5>
          <a :href="translateUriEnv(this['@id'])">
            {{ this.label.replace(` · ${this.code}`, "") }}
          </a>
        </h5>
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
    <div v-else class="TermTreeItem-label" :id="this['@id'].split('/').pop()">
      <h5>
        <a :href="translateUriEnv(this['@id'])">
          {{ this.label.replace(` · ${this.code}`, "") }}
        </a>
      </h5>
    </div>
  </li>
</template>

<script>
import { mapGetters } from "vuex";
import LensMixin from "@/mixins/lens";

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
  computed: {
    ...mapGetters([
      "vocab",
      "vocabContext",
      "resources",
      "settings",
      "appState",
    ]),
  },
  methods: {},
};
</script>

<style lang="scss">
.total-term-items {
  color: $gray-700;
}

.TermTreeItem {
  &-label {
    display: flex;
    align-items: center;
    padding: 1em 0.5em;
  }

  &-group {
    position: relative;

    &[open] {
      background: $white;

      & > summary {
        background: $white;
      }
    }
    & > ul {
      padding-left: calc(var(--level, 0) * 32px);
    }

    &-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 16px;
      margin-right: 8px;
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
  }

  & a {
    color: $kb-secondary-turquoise;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}

summary.TermTreeItem-label {
  &:hover {
    @media (min-width: 768px) {
      position: relative;
      background-color: $white;
      z-index: 500 !important;
      background-color: $white;
      box-shadow: 0 0.15em 0.25em 0 rgba(0, 0, 0, 0.25);
    }
  }
  & h5 {
    font-weight: 500;
  }
}

.TermTreeRootItem {
  background-color: $gray-100;
  border: solid $gray-200;
  border-width: 1px 1px 1px 1px;
}

.TermTreeRootItem > .TermTreeItem-label {
  & h5 {
    font-weight: 500;
  }
}
</style>
