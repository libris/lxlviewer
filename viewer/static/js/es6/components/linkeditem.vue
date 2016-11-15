<script>
import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';

export default {
  name: 'linked-item',
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
  },
  data: function() {
    return {
      focused: false,
    }
  },
  computed: {
  },
  methods: {
    removeThis() {
      const holder = this.$parent.value;
      if (_.isArray(holder)) {
        this.$parent.removeById(this.item['@id']);
      } else if (_.isPlainObject(holder)) {
        this.$parent.removeKey(this.key);
      } else {
        this.$parent.emptyValue();
      }
    },
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
  },
  components: {
    'processed-label': ProcessedLabel,
  },
};
</script>

<template id="linked-item">
  <div class="link-container" v-bind:class="{'focused': focused}">
    <div class="linked">
      <processed-label :item="item"></processed-label>
      <i class="delete fa fa-close" v-on:click="removeThis()" v-if="!isLocked"></i>
    </div>
    <div class="linked-popup">
      <div class="header">
        <span class="item-label"><a v-on:focus="addFocus" v-on:blur="removeFocus" href="{{ item['@id'] }}"><processed-label :item="item"></processed-label></a></span>
        <span class="item-type text-right" v-if="item['@type']">{{ item['@type'] | labelByLang }}</span>
        <span class="item-type text-right unknown" v-if="!item['@type']">OKÄND TYP</span>
      </div>
      <div class="body">
        <p v-for="(k, v) in item" v-if="k !== '@id' && k !== '@type'"><b>{{ k }}:</b> {{ v | json }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import '../../../less/main_libris.less';

// Variables
@chipColor: #e4e4e4;
@chipTextColor: rgba(0,0,0,0.6);

.link-container {
  margin: 0px 0px 0px 0px;
  display: inline-block;
  line-height: 0;
  cursor: default;
  * {
    line-height: 1.6;
  }
  .linked {
    display: inline-block;
    background-color: @chipColor;
    color: @chipTextColor;
    font-size: 85%;
    border-radius: 1em;
    padding: 2px 10px;
    margin: 0px 0px 3px 0px;
    .delete {
      cursor: pointer;
      color: fadeout(@chipTextColor, 25%);
      &:hover {
        color: @chipTextColor;
      }
    }
    &:hover {
      transition: background-color ease 0.25s;
      background-color: darken(@chipColor, 5%);
    }
  }
  .linked-popup {
    position: absolute;
    opacity: 0;
    overflow: hidden;
    transition: 0.3s ease;
    transition-property: opacity, width, height;
    border: 1px solid;
    border-color: #bdbdbd;
    border-bottom-color: #6d6d6d;
    background-color: #efefef;
    border-radius: 3px;
    box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.3);
    color: #5a5a5a;
    word-wrap: break-word;
    width: 0px;
    height: 0px;
    padding: 0px;
    margin: 0px;
    .header {
      border: solid #bdbdbd;
      border-width: 0px 0px 1px 0px;
      padding: 3px;
      span {
        display: inline-block;
      }
      .item-label {
        width: 59%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        float: left;
        a {
          color: inherit;
        }
      }
      .item-type {
        font-weight: bold;
        text-transform: uppercase;
        width: 39%;
        font-size: 75%;
      }
    }
    .body {
      padding: 3px;
      height: 90px;
      width: 398px;
      overflow-y: scroll;
      p {
        margin: 0px;
      }
    }
  }
  &:hover, &.focused {
    .linked-popup {
      width: 400px;
      height: 120px;
      opacity: 1;
    }
  }
  &:hover {
    .linked-popup {
      transition-delay: 0.5s;
    }
  }
}

</style>
