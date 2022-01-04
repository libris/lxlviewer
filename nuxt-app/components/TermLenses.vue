<template>      
  <div class="TermLenses">
    <div class="btn btn-kb-primary-grey" @click="toggleLenses" href="#" @keyup.enter="toggleLenses"><i class="bi-fill"></i> {{ appState.showLenses ? 'Hide' : 'Show' }} lens definitions</div>
    <div v-if="appState.showLenses" class="TermLenses-panel">
      <h2>Lens definitions</h2>
      <hr>
      <div class="TermLenses-level">
        <h2>Tokens</h2>
        <p>
          A token is the smallest representation available, and is generally constrained to using only one property.
          Used within chips when they contain inner entities, or when we want to represent an entity using very few characters.
        </p>
        <template v-if="lensDefinitions.tokens.length > 0">
          <p>Entity of type <code>{{ lensType }}</code> will be represented as a token by using the following properties:</p>
          <TermLensesList level="Token" :list="lensDefinitions.tokens" />
        </template>
        <p v-else><code>{{ lensType }}</code> doesn't have a definition for tokens.</p>
      </div>
      <hr>
      <div class="TermLenses-level">
        <h2>Chips</h2>
        <p>A chip is a small representation of an entity and generally contain 1-3 properties. Used for constructing a label for an entity.</p>
        <template v-if="lensDefinitions.chips.length > 0">
          <p>Entity of type <code>{{ lensType }}</code> will be represented as a chip by using the following properties:</p>
          <TermLensesList level="Chip" :list="lensDefinitions.chips" />
        </template>
        <p v-else><code>{{ lensType }}</code> doesn't have a definition for chips.</p>
      </div>
      <hr>
      <div class="TermLenses-level">
        <h2>Cards</h2>
        <p>A card is a larger representation of an entity, usually displayed with several rows of information.</p>
        
        <template v-if="lensDefinitions.cards.length > 0">
          <p>Entity of type <code>{{ lensType }}</code> will be represented as a card by using the following properties:</p>
          <TermLensesList level="Card" :list="lensDefinitions.cards" />
        </template>
        <p v-else><code>{{ lensType }}</code> doesn't have a definition for cards.</p>
      </div>
      <hr>
      <div class="TermLenses-level">
        <h2>Full</h2>
        <p>Used to prioritize some properties in the context of a full viewing of an entity. This is generally used to put the defined properties before other properties in a list.</p>
        <template v-if="lensDefinitions.full.length > 0">
          <p>Entity of type <code>{{ lensType }}</code> will prioritize the following properties:</p>
          <TermLensesList level="Full" :list="lensDefinitions.full" />
        </template>
        <p v-else><code>{{ lensType }}</code> doesn't have a definition for full viewing.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as DisplayUtil from 'lxljs/display';
import TermLensesList from '@/components/TermLensesList';

export default {
  data() {
    return {

    }
  },
  props: {
    entity: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapGetters(['vocab', 'vocabContext', 'resources', 'settings', 'appState']),
    lensType() {
      return this.entity['@id'].split('/').pop();
    },
    lensDefinitions() {
      const lenses = {};
      lenses.tokens = DisplayUtil.getDisplayProperties(this.lensType, this.resources, this.settings, 'tokens');
      lenses.chips = DisplayUtil.getDisplayProperties(this.lensType, this.resources, this.settings, 'chips');
      lenses.cards = DisplayUtil.getDisplayProperties(this.lensType, this.resources, this.settings, 'cards');
      lenses.full = DisplayUtil.getDisplayProperties(this.lensType, this.resources, this.settings, 'full');
      return lenses;
    },
  },
  methods: {
    toggleLenses() {
      if (this.appState.showLenses) {
        this.$store.dispatch('setAppState', { property: 'showLenses', value: false });
      } else {
        this.$store.dispatch('setAppState', { property: 'showLenses', value: true });
      }
    },
  },
  components: {
    TermLensesList,
  },
}
</script>

<style lang="scss">

.TermLenses {
  &-panel {
    margin-top: 0.5em;
    padding-top: 0.5em;
    background-color: $white;
    border: solid #e9ecef;
    border-width: 1px;
    @media (min-width: 768px) {
      box-shadow: 0 0.15em 0.25em 0 rgba(0, 0, 0, 0.25);
    }
  }
  &-level {
    padding-bottom: 1em;
  }
  hr {
    height: 1px;
    background-color: $gray-200;
    color: $gray-200;
    border-top: solid 1px $gray-200;
    margin: 0.5em 1.5rem;
  }
}

</style>