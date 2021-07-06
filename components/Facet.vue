<template>
  <div class="Facet" @click="toggle" @keyup.enter="toggle" tabindex="0" :title="label">
    <span class="Facet-check">
      <i class="bi-square" v-if="!checked"></i>
      <i class="bi-check-square-fill" v-if="checked"></i>
    </span>
    <span class="Facet-label">
      {{ label }}
    </span>
    <span class="Facet-count">
      {{ facet.totalItems }}
    </span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false
    }
  },
  props: {
    facet: {
      type: Object,
    },
    dimension: {
      type: String,
    }
  },
  methods: {
    toggle() {
      if (this.checked) {
        const newQuery = Object.assign({}, this.$route.query);
        delete newQuery[this.dimension];
        this.$router.push({
          query: newQuery
        });
      } else {
        this.$router.push({
          path: this.facet.view['@id']
        });
      }
    },
  },
  computed: {
    checked() {
      if (this.$route.query.hasOwnProperty(this.dimension) && this.$route.query[this.dimension] === this.facet.object['@id']) {
        return true;
      }
      return false;
    },
    label() {
      let prop = '';
      if (this.facet.object.hasOwnProperty('labelByLang')) {
        prop = 'labelByLang';
      } else if (this.facet.object.hasOwnProperty('titleByLang')) {
        prop = 'titleByLang';
      }
      return this.facet.object[prop]['sv'];
    }
  }
}
</script>

<style lang="scss">
.Facet {
  cursor: pointer;
  display: flex;
  padding: 0.2em 0;
  &-check {
    width: 1.75em;
    .bi-square {
      color: $gray-500;
    }
    .bi-check-square-fill {
      color: $kb-secondary-turquoise;
    }
  }
  &-label {
    flex-grow: 1;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &-count {
    color: $gray-600;
    padding-left: 0.5em;
    align-self: flex-end;
  }
}
</style>
