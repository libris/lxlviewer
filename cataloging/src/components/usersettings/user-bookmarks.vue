<script>
import { mapGetters } from 'vuex';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'user-bookmarks',
  props: {
  },
  methods: {
    translatePhrase,
    purgeBookmarks() {
      this.$store.dispatch('purgeUserTagged', 'Bookmark');
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'user',
      'userStorage',
      'settings',
      'resources',
      'userBookmarks',
    ]),
  },
  components: {
  },
  watch: {
  },
};
</script>

<template>
  <section class="UserBookmarks">
    <div class="UserBookmarks-content">
      <h4>{{ translatePhrase('Bookmarks') }}</h4>
      <div class="UserBookmarks-itemList">
        <div class="UserBookmarks-item" v-for="item in userBookmarks" :key="item['@id']">
          <div class="UserBookmarks-itemLabel">
            <a :href="`/katalogisering/${item['@id'].split('/').pop()}`">{{ item.label }}</a>
          </div>
          <div class="UserBookmarks-itemAction">
            <button class="btn btn-warning"><i class="fa fa-times" /></button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="less">

.UserBookmarks {
  padding: 0;

  @media (min-width: @screen-sm) {
    padding: 1em 0 1em 0;
  }

  &-title {
    flex: 1 1 100%;
  }

  &-content {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    background-color: @white;
    border-radius: 4px;
    box-shadow: @shadow-panel;

    @media (min-width: @screen-sm) {
      flex-direction: row;
    }
  }
  &-itemList {
    width: 100%;
  }
  &-item {
    display: flex;
    padding: 0.25em 0;
    width: 100%;
    padding: 0.25em;
    &:nth-child(odd) {
      background-color: @list-item-bg-odd;
    }
  }
  &-itemLabel {
    white-space: nowrap;
    word-break: break-all;
    overflow-x: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
  }
  &-itemAction {
    margin-left: 1em;
    text-align: right;
  }
}

</style>
