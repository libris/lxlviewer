<script>
import { mapGetters } from 'vuex';
import * as StringUtil from '@/utils/string';
import UserAvatar from '@/components/shared/user-avatar';
import SearchForm from '@/components/search/search-form';

export default {
  name: 'search-bar',
  data() {
    return {
      hasAvatar: true,
    };
  },
  components: {
    'user-avatar': UserAvatar,
    'search-form': SearchForm,
  },
  methods: {
  },
  computed: {
    ...mapGetters([
      'userCare',
      'settings',
      'user',
    ]),
    environmentLabel() {
      if (this.settings.environment !== 'prod') {
        return this.settings.environment;
      }
      return '';
    },
  },
  mounted() {
  },
};
</script>

<template>
  <div class="SearchBar" id="SearchBar" aria-labelledby="service-name">
    <div class="SearchBar-container container">
      <div class="row">
        <div class="SearchBar-brand hidden-sm hidden-xs col-md-3">
          <router-link to="/" class="SearchBar-brandLink">
            <img class="SearchBar-brandLogo" src="~kungbib-styles/dist/assets/kb_logo_black.svg" alt="Kungliga Bibliotekets logotyp">
          </router-link>
          <router-link to="/" class="SearchBar-brandTitle" :title="`Version ${settings.version}`">
            <span id="service-name">{{ settings.title }}</span>
            <span class="SearchBar-envLabel">
            {{ environmentLabel }} {{ settings.version }}
            </span>
          </router-link>
        </div>
        <search-form class="SearchBar-searchForm col-sm-12 col-md-9" :search-perimeter="$route.params.perimeter" />
      </div>
    </div>
  </div>
</template>


<style lang="less">
.SearchBar {
  &.stick-to-top {
    position: fixed;
    top: 0;
  }
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
  // will-change: transform;
  z-index: @sticky-bar-z;
  width: 100%;
  padding: 0 0 0.5rem 0;
  @media screen and (min-width: @screen-sm){
    padding: 1rem 0 0.5rem 0;
  }
  background-color: @bg-sticky-bar;
  border: solid @grey-lighter;
  border-width: 0px 0px 3px 0px;
  flex-shrink: 0; // fix ie flexbox height bug
  height: auto;

  &-container {
    padding: 0 25px;
    align-items: center;
    
    @media screen and (min-width: @screen-sm){
      padding: 0 15px;
    }
    @media screen and (max-width: @screen-lg){
      flex-wrap: wrap;
      width: 100% !important;
    }
  }

  &-brand {
    display: flex;
    margin: 0;
  }

  &-searchForm {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
  }

  &-brandLogo {
    display: none;
    @media screen and (min-width: @screen-md){
      display: inline-block;
    }
    margin: 4px 0 0;
    vertical-align: middle;
    width: 80%;
  }

  &-brandLink {
    display: inline-block;
    width: 50px;
  }

  &-brandTitle {
    display: none;
    @media screen and (min-width: @screen-md){
      display: inline-block;
    }
    color: @black;
    cursor: pointer;
    float: right;
    font-size: 14px;
    font-size: 1.4rem;
    line-height: 20px;
    padding: 15px 5px 15px 0px;
    height: 50px;

    &:hover,
    &:focus,
    &:active,
    &:visited {
      color: @black;
      text-decoration: none;
    }

    .container-fluid {
      padding: 0 30px 0 15px;
    }
  }

  &-envLabel {
    display: block;
    color: @text-brand-env;
    font-size: 0.9rem;
    font-weight: bold;
    float: right;
    margin: -1em 0px 0px 0em;
    text-transform: uppercase;
  }
}


</style>
