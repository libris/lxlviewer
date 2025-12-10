<script>
import TagSwitch from "@/components/shared/tag-switch.vue";

export default {
  name: 'flagged-list',
  components: {TagSwitch},
  props: {
    flagged: {
      type: Array,
    },
  },
};
</script>

<template>
  <div class="Flagged">
    <div class="Flagged-items">
      <div
        class="Flagged-item"
        :key="item['@id']"
        v-for="item in flagged">
        <entity-summary
          :focus-data="item"
          :valueDisplayLimit=1
          :encodingLevel="item.encodingLevel"/>
        <div class="Flagged-icon">
          <tag-switch
            :document="item"
            :action-labels="{ on: 'Mark as', off: 'Unmark as' }"
            tag="Flagged"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.Flagged {
  &-item {
    border: 1px solid @grey-lighter;
    background-color: @white;
    padding: 2px 4px 0 4px;
    margin-bottom: 10px;
  }
  &-icon {
    display: flex;
    padding-right: 8px;
    padding-bottom: 8px;
    justify-content: flex-end;
  }
}
</style>
