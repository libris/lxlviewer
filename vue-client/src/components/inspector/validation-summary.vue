<script>
import * as LayoutUtil from '@/utils/layout';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'validation-summary',
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    inspector() {
      return this.$store.getters.inspector;
    },
    violations() {
      return this.inspector.validation.violations;
    },
    numberOfViolations() {
      return this.inspector.validation.numberOfViolations;
    },
  },
  data() {
    return {
      showViolationList: false,
    };
  },
  methods: {
    translatePhrase,
    goToPath(path) {
      const id = `formPath-${path}`;
      const $element = document.getElementById(id);
      this.$store.dispatch('pushInspectorEvent', {
        name: 'form-control',
        value: 'expand-item',
      });
      setTimeout(() => {
        LayoutUtil.scrollToElement($element, 1000, () => {});
      }, 1000);
    },
  },
};
</script>

<template>
  <div class="ValidationSummary" v-show="numberOfViolations > 0">
    <i class="fa fa-warning" /> Fann <strong>{{ numberOfViolations }}</strong>
    fall av oväntad data i denna post. Detta kan leda till oväntade resultat vid till exempel export.
    <a class="pull-right" @click="showViolationList = true" v-show="!showViolationList">Visa detaljerad lista</a>
    <a class="pull-right" @click="showViolationList = false" v-show="showViolationList">Dölj detaljerad lista</a>
    <table class="table table-striped" v-if="showViolationList">
      <thead>
        <th>Nod</th><th>Anledning(ar)</th>
      </thead>
      <tr class="Violation" v-for="(value, key) in violations" :key="key">
        <td class="Violation-key">
          <a @click="goToPath(key)"><i class="fa fa-tag" /></a>
          <code>{{ key }}</code>
        </td>
        <td class="Violation-value">
          <ul>
            <li :key="reason.text" v-for="reason in value">- {{ translatePhrase(reason.text) }} <code v-if="reason.hint">{{ reason.hint }}</code></li>
          </ul>
        </td>
      </tr>
    </table>
  </div>
</template>

<style lang="less">
.ValidationSummary {
  padding: 0.5em;
  border-radius: 0.25em;
  border: 1px solid red;
  background-color: #ffebeb;
  a {
    color: black;
  }
  table {
    background-color: #fff;
    thead {
      border: 1px solid @grey;
      border-width: 0px 0px 1px 0px;
    }
    .Violation {
      border: 1px solid @grey-light;
      border-width: 0px 0px 1px 0px;
      &-nav {
        text-align: center;
      }
      &-key {
        code {
          background-color: transparent;
          color: black;
        }
      }
      &-value {
        code {
          margin-left: 0.5em;
          background-color: rgba(0, 0, 0, 0.075);
          color: black;
        }
      }
    }
    td, th {
      vertical-align: top;
      padding: 0.25em;

      ul {
        list-style: none;
        padding-left: 0px;
        margin-bottom: 0px;
      }
    }
  }
}
</style>
