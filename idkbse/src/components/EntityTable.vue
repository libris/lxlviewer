<template>
  <div class="EntityTable-body" :class="{ 'is-inner-table': isInnerTable, 'is-linked-table': isLinked }" v-if="itemData">
    <div class="PropertyRow d-md-flex" v-if="showUri && itemData.hasOwnProperty('@id')">
      <div class="PropertyRow-bodyKey d-block d-md-inline" title="@id">
        URI ({{ translateUi('link to resource') }})
      </div>
      <div class="PropertyRow-bodyValue">
        <template v-if="isInternalUri(itemData['@id'])">
          <NuxtLink :to="removeBaseUri(itemData['@id'])">
            {{ translateUriEnv(itemData['@id']) }}
          </NuxtLink>
        </template>
        <template v-else>
          <a :href="translateUriEnv(itemData['@id'])">
            {{ translateUriEnv(itemData['@id']) }}
          </a>
        </template>
        <i class="PropertyRow-idCopyButton bi" v-show="clipboardAvailable" title="Kopiera URI" :class="{ 'bi-clipboard': !idCopied, 'bi-clipboard-check': idCopied }" @click="copyId"></i>
      </div>
    </div>
    <PropertyRow :property="prop" :key="prop" :value="itemData[prop]" :is-inner="isInnerTable" v-for="prop in sortedProperties" />
    <template v-if="isMainEntity">
      <div class="PropertyRow d-md-flex" v-if="showDownload">
        <div class="PropertyRow-bodyKey d-block d-md-inline">{{ translateUi('Download') }}</div>
        <div class="PropertyRow-bodyValue"><a :href="this.$translateAliasedUri(`${ recordId }/data.jsonld`)">JSON-LD</a> • <a :href="this.$translateAliasedUri(`${ recordId }/data.ttl`)">Turtle</a> • <a :href="this.$translateAliasedUri(`${ recordId }/data.rdf`)">RDF/XML</a></div>
      </div>
      <div class="PropertyRow d-md-flex" v-if="showOtherServices">
        <div class="PropertyRow-bodyKey d-block d-md-inline">{{ translateUi('Other sites') }}</div>
        <div class="PropertyRow-bodyValue multiple">
          <div v-for="service in otherServices"><a :href="service.link">{{service.title}}</a></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as DisplayUtil from 'lxljs/display';
import * as VocabUtil from 'lxljs/vocab';
import LensMixin from '@/mixins/lens';
import PropertyRow from '@/components/PropertyRow';

export default {
  mixins: [LensMixin],
  data() {
    return {
      hiddenProperties: [
        '@type',
        '@id',
        'reverseLinks',
        'meta',
        'hasItem',
        'baseClassChain',
      ],
      idCopied: false,
      clipboardAvailable: false,
    };
  },
  mounted() {
    this.clipboardAvailable = typeof navigator !== 'undefined' && typeof navigator.clipboard !== 'undefined';
  },
  methods: {
    copyId() {
      const self = this;
      navigator.clipboard.writeText(this.ownPath).then(function() {
        self.idCopied = true;
        setTimeout(() => {
          self.idCopied = false;
        }, 1000);
      }, function(err) {
        console.error('Async: Could not copy text: ', err);
      });
    },
  },
  computed: {
    ...mapGetters(['display', 'quoted', 'currentDocument', 'resources', 'vocabContext', 'settings', 'vocab', 'appState']),
    recordId() {
      if (this.itemData.meta && this.itemData.meta['@id']) {
        return this.itemData.meta['@id'];
      } else if (this.currentDocument && this.currentDocument.record && this.currentDocument.record['@id']) {
        return this.translateUriEnv(this.currentDocument.record['@id']);
      } else if (this.itemData['@id']) {
        return this.itemData['@id'];
      }
      return null;
    },
    controlNumber() {
      if (this.currentDocument && this.currentDocument.record && this.currentDocument.record.controlNumber) {
        return this.currentDocument.record.controlNumber
      }
      return null;
    },
    documentId() {
      if (this.itemData['@id']) {
        return this.translateUriEnv(this.itemData['@id']).split('#').shift();
      }
      return null;
    },
    isInnerTable() {
      return this.isMainEntity == false;
    },
    isLinked() {
      return this.isInnerTable && this.entity.hasOwnProperty('@id');
    },
    itemData() {
      if (this.entity.hasOwnProperty('@type')) {
        return this.entity;
      }
      return this.quoted[this.entity['@id']];
    },
    ownPath() {
      return this.translateUriEnv(this.itemData['@id']);
    },
    sortedProperties() {
      const propertyOrder = DisplayUtil.getDisplayProperties(this.itemData['@type'], this.resources, this.settings, 'full');
      const translatedOrder = [];
      propertyOrder.forEach((prop) => {
        let currentProp = prop;
        if (typeof currentProp === 'string' && currentProp.includes('@reverse')) {
          const termObj = VocabUtil.getTermObject(currentProp.split('/').pop(), this.vocab, this.vocabContext);
          if (termObj && termObj.hasOwnProperty('inverseOf')) {
            currentProp = termObj['inverseOf']['@id'].split('/').pop();
          }
          else if (termObj && termObj['@type'] === 'owl:SymmetricProperty') {
            currentProp = currentProp.split('/').pop();
          }
        }
        if (this.itemData.hasOwnProperty(currentProp) && this.hiddenProperties.includes(currentProp) == false) {
          translatedOrder.push(currentProp);
        }
      });
      const objectToInject = this.itemData.hasOwnProperty('@reverse') ? this.afterInverseReverse : this.itemData;
      Object.keys(objectToInject).forEach((prop) => {
        if (translatedOrder.includes(prop) == false && this.hiddenProperties.includes(prop) == false) {
          translatedOrder.push(prop);
        }
      });
      return translatedOrder;
    },
    afterInverseReverse() {
      const extracted = {};
      for (const [key, value] of Object.entries(this.itemData['@reverse'])) {
        const termObj = VocabUtil.getTermObject(key, this.vocab, this.vocabContext);
        if (termObj.hasOwnProperty('inverseOf')) {
          const reverseKey = termObj['inverseOf']['@id'].split('/').pop();
          extracted[reverseKey] = value;
        } else if (termObj['@type'] === 'owl:SymmetricProperty') {
          extracted[key] = value;
        } else {
          const capitalizedKey = key[0].toUpperCase() + key.slice(1);
          extracted[`in${capitalizedKey}Of`] = value;
        }
      }
      const combinedData = Object.assign(this.itemData, extracted);
      delete combinedData['@reverse'];
      return combinedData;
    },
    otherServices() {
      const links = []

      let p = this.recordId.split('/');
      const id = p.pop();
      p.push('katalogisering');
      p.push(id);
      const catLink = p.join('/');
      links.push({
        'link': catLink,
        'title': 'Libris katalogisering'
      });

      const baseType = VocabUtil.getRecordType(this.itemData['@type'], this.vocab, this.vocabContext)
      if(this.controlNumber && baseType === 'Instance') {
        let p = this.recordId.split('/');
        p.pop();
        p.push('bib');
        p.push(this.controlNumber);
        links.push({
          'link': p.join('/'),
          'title': 'Libris webbsök'
        });
      }

      return links
    }
  },
  props: {
    entity: {
      type: Object,
      default: null,
    },
    isMainEntity: {
      type: Boolean,
      default: true,
    },
    showDownload: {
      type: Boolean,
      default: false,
    },
    showOtherServices: {
      type: Boolean,
      default: false,
    },
    showUri: {
      type: Boolean,
      default: true,
    }
  },
  components: {
    PropertyRow,
  },
}
</script>

<style lang="scss">
.PropertyRow {
  &-idCopyButton {
    margin-left: 0.5em;
    transition: top .50s linear;
    position: relative;
    cursor: pointer;
    top: 0em;
    &.bi-clipboard-check {
      color: $kb-secondary-turquoise;
      transition: top .15s ease-in-out;
      top: -0.35em;
    }
    &:hover {
      color: $kb-secondary-turquoise;
    }
  }
}

.EntityTable {
  border: solid $gray-200;
  border-width: 0px 1px 1px 1px;
  &:first-child {
    border-width: 1px 1px 1px 1px;
  }
  &-header {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 0.5em 1em;
    gap: 1em;
    > span {
      padding: 0.5em;
      &:first-child {
        flex-grow: 1;
      }
    }
  }
  &-title {
    a {
      color: $kb-secondary-turquoise;
      font-weight: 500;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  &-body {
    padding: 0.5rem 0.25rem 0.5rem 1rem;
    @media (min-width: 768px) {
      padding: 0.5rem 1rem 0.5rem 1.5rem;
    }
    &.is-inner-table {
      border: solid $gray-200;
      border-width: 0px 0px 0px 1px;
    }
    &.is-linked-table {
      border-width: 1px 1px 1px 1px;
      border-color: #badbde;
      background-color: #faffff;
    }
  }
  &.hovered {
    box-shadow: 0 0.25em 0.5em 0 rgba(0, 0, 0, 0.25);
    .chip {
      border-color: $gray-500;
      color: $black;
    }
  }
  .chip {
    transition: 0.25s ease all;
    border: 1px solid $gray-100;
    background-color: $gray-100;
    border-radius: 2em;
    color: $gray-600;
    padding: 0.5em 0.75em;
  }
}

</style>
