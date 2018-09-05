<script>
import { mapGetters } from 'vuex';
import * as StringUtil from '@/utils/string';

export default {
  name: 'footer-component',
  props: {
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
    translate() {
      const langCode = this.settings.language;
      let translationEls = document.querySelectorAll('.js-translateable');

      _.each(translationEls, function (translationEl) {
        const originalText = translationEl.getAttribute('data-translateable');
        const newText = StringUtil.getUiPhraseByLang(originalText, langCode);
        translationEl.innerHTML = newText;
      });
    }
  },
  computed: {
    ...mapGetters([
      'settings',
    ]),
  },
  components: {
  },
  watch: {
  },
  mounted() { 
    this.$nextTick(() => {
      this.translate();
    });
  },
};
</script>

<template>
  <footer class="Footer">
      <div class="Footer-content">
        <div class="Footer-serviceName">
          <img src="~kungbib-styles/dist/assets/kb_logo_white.svg" class="Footer-serviceLogo" alt="Kungliga bibliotekets logotyp" />
          <a class="Footer-link" href="http://www.kb.se" alt="Länk till Kungliga bibliotekets webbplats">
            <span class="js-translateable" data-translateable="National Library of Sweden">National Library of Sweden</span>
          </a>
        </div>

        <div class="Footer-navGroup">
          <nav class="Footer-nav" aria-labelledby="footer-xl-nav">
            <h4 id="footer-xl-nav" class="Footer-listTitle" data-translateable="XL">XL</h4>
            <ul class="Footer-navList">
              <li>
                <router-link class="Footer-link" to="/about" >{{ "About XL" | translatePhrase }}</router-link>
              </li>
              <li>
                <a href="https://goo.gl/forms/TSCafatX9qKyMqK02" class="Footer-link js-translateable" data-translateable="Suggest change">Suggest change</a>
              </li>
              <li>
                <a href="https://goo.gl/forms/xJ837GVLmG6IHwsu2" class="Footer-link js-translateable" data-translateable="Report error" >Report error</a>
              </li>
              <li>
                <a href="https://www.kb.se/libris/Om-Libris/Versionsinformation/" class="Footer-link js-translateable" data-translateable="Release notes">Release notes</a>
              </li>
            </ul>
          </nav>

          <nav class="Footer-nav" aria-labelledby="footer-libris-nav">
            <h4 id="footer-libris-nav" class="Footer-listTitle js-translateable" data-translateable="New Libris and XL">New Libris and XL</h4>
            <ul class="Footer-navList">
              <li>
                <a href="https://www.youtube.com/watch?v=p2vcgoTfNpw&list=PLZVkEICvA5-GRT2oJQmLgq_2Pksx6zYPy" class="Footer-link js-translateable" data-translateable="Instruction videos" >Instruction videos</a>
              </li>
              <li>
                <a href="http://librisbloggen.kb.se/" class="Footer-link js-translateable" data-translateable="Librisbloggen" >Librisbloggen</a>
              </li>
              <li>
                <a href="http://kb.se/libris/Om-LIBRIS/Introduktion-till-nya-Libris-och-XL/" class="Footer-link js-translateable" data-translateable="Introduction material" >Introduktionsmaterial</a>
              </li>
              <li>
                <a href="http://www.kb.se/libris/" class="Footer-link js-translateable" >kb.se/libris</a>
              </li>
              <li>
                <a href="https://libris.kb.se/" class="Footer-link js-translateable" >libris.kb.se</a>
              </li>
            </ul>
          </nav>

          <nav class="Footer-nav" aria-labelledby="footer-support-nav">
            <h4 id="footer-support-nav" class="Footer-listTitle" data-translateable="Support">Support</h4>
            <ul class="Footer-navList">
              <li>
                <a class="Footer-link js-translateable" href="https://kundo.se/org/librisxl/" data-translateable="Forum of support for new Libris" >Forum of support for new Libris</a>
              </li>
              <li>
                <a class="Footer-link js-translateable" href="http://www.kb.se/libris/kontakta/" data-translateable="Libris customer service" >Libris customer service</a>
              </li>
            </ul>
          </nav>

          <nav class="Footer-nav" aria-labelledby="footer-sm-nav">
            <h4 id="footer-sm-nav" class="Footer-listTitle js-translateable" data-translateable="Social media">Social media</h4>
            <ul class="Footer-navList Footer-navList--socialMedia">
              <li class="Footer-navItem">
                <a class="Footer-link" href="https://www.youtube.com/user/KunglBiblioteket/" title="National Library of Sweden on Youtube" >
                  <i class="fa fa-2x fa-youtube-play" aria-hidden="true"></i>
                </a>
              </li>
              <li class="Footer-navItem">
                <a class="Footer-link" href="https://twitter.com/librisnytt/" title="LibrisNytt on Twitter" >
                  <i class="fa fa-2x fa-twitter-square" aria-hidden="true"></i>
                </a>
              </li>
              <li class="Footer-navItem">
                <a class="Footer-link" href="https://www.facebook.com/LibrisNytt/" title="LibrisNytt on Facebook" >
                  <i class="fa fa-2x fa-facebook-square" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
  </footer>
</template>

<style lang="less">

.Footer {
  padding: 25px 10px;
  background-color: @bg-footer;
  color: @text-footer;

  &-content {
    display: flex;
    justify-content: center; 
  }

  &-serviceName {
    padding: 0 1em;
    flex: 20% 1 1;
    font-size: 14px;
    font-size: 1.4rem;
    line-height: 1.2;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    justify-content: flex-start;
    font-weight: 700;
    display: block;

   @media (min-width: 768px) {
      display: flex;
      text-align: center;
      font-size: 16px;
      font-size: 1.6rem;
    }
  }

  &-serviceLogo {
    height: 75px;
    margin: 0 30px 10px 0;
    width: auto;

    @media (min-width: 768px) {
      display: inline-block;
      margin: 0 0 10px;
    }

    @media (min-width: 998px) {
      margin: 0 0 10px;
    }
  }

  &-navGroup {
    display: block;
    list-style-type: none;
    flex: 80% 2 2;

    @media (min-width: @screen-sm) {
      display: flex;
    }
  }

  &-nav {
    flex: 25% 2 2;
    flex-direction: column;
    margin: 0 20px 20px 0;
  }

  &-navList {
    font-size: 14px;
    font-size: 1.4rem;
    list-style-type: none;
    margin: 0;
    padding: 0;

    @media (min-width: @screen-md) {
      font-size: 16px;
      font-size: 1.6rem;
    }
  }

  &-navItem {
    .Footer-navList--socialMedia & {
       display: inline;
       margin: 0 5px;
    }
  }

  &-link {
    color: @text-footer;
    text-transform:none;
    &:hover, 
    &:focus {
      color: @text-footer;
    }
  }

  &-listTitle {
    color: @white;
    font-size: 14px;
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0 0 5px 0;

    @media (min-width: @screen-md) {
      font-size: 16px;
      font-size: 1.6rem;
    }
  }

  i {
    color: @text-alt-footer;
  }

  @media print {
    display: none;
  }
}

</style>