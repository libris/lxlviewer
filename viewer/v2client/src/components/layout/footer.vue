<script>
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
  },
  computed: {
  },
  components: {
  },
  watch: {
    keyword(value, oldval) {
      console.log("keyword changed", value, oldval);
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <footer class="Footer">
      <div class="content-container Footer-content">
        <div class="Footer-serviceName">
          <img src="~kungbib-styles/dist/assets/kb_logo_white.svg" class="logo-medium" alt="Kungliga bibliotekets logotyp" />
          <a class="Footer-link" href="http://www.kb.se" alt="Länk till Kungliga bibliotekets webbplats">
            <span class="brand-text js-translateable" data-translateable="National Library of Sweden">National Library of Sweden</span>
          </a>
        </div>
        <ul class="Footer-contentList">
          <li class="Footer-contentItem">
            <h4 id="XLLinks" class="Footer-listTitle" data-translateable="XL">XL</h4>
            <ul class="Footer-linkList" aria-labelledby="XLLinks">
              <li class="item" role="listitem">
                <router-link class="Footer-link" to="/about" role="link">{{ "About XL" | translatePhrase }}</router-link>
              </li>
              <li class="item" role="listitem">
                <a href="https://goo.gl/forms/dPxkhMqE10RvKQFE2" class="Footer-link js-translateable" data-translateable="Suggest change" role="link" alt="Suggest change">Suggest change</a>
              </li>
              <li class="item" role="listitem">
                <a href="https://goo.gl/forms/3mL7jTlEpbU3BQM13" class="Footer-link js-translateable" data-translateable="Report error" role="link" alt="Report error">Report error</a>
              </li>
            </ul>
          </li>

          <li class="Footer-contentItem">
            <h4 id="LibrisLinks" class="Footer-listTitle js-translateable" data-translateable="New Libris and XL">New Libris and XL</h4>
            <ul class="Footer-linkList" aria-labelledby="LibrisLinks">
              <li class="item">
                <a href="https://www.youtube.com/watch?v=p2vcgoTfNpw&list=PLZVkEICvA5-GRT2oJQmLgq_2Pksx6zYPy" class="Footer-link js-translateable" data-translateable="Instruction videos" role="link" alt="Instruction videos">Instruction videos</a>
              </li>
              <li class="item">
                <a href="http://librisbloggen.kb.se/" class="Footer-link js-translateable" data-translateable="Librisbloggen" role="link" alt="Libris blog">Librisbloggen</a>
              </li>
              <li class="item">
                <a href="http://www.kb.se/libris/Om-LIBRIS/Introduktion-till-nya-Libris-och-XL2/" class="Footer-link js-translateable" data-translateable="Introduction material" role="link" alt="Introduction material">Introduktionsmaterial</a>
              </li>
              <li class="item">
                <a href="http://www.kb.se/libris/" class="Footer-link js-translateable" role="link">kb.se/libris</a>
              </li>
              <li class="item">
                <a href="https://libris.kb.se/" class="Footer-link js-translateable" role="link">libris.kb.se</a>
              </li>
            </ul>
          </li>

          <li class="Footer-contentItem">
            <h4 id="SupportList" class="Footer-listTitle" data-translateable="Support">Support</h4>
            <ul class="Footer-linkList" aria-labelledby="SupportList">
              <li class="item">
                <a class="Footer-link js-translateable" href="https://kundo.se/org/librisxl/" data-translateable="Forum of support for new Libris" role="link" alt="Forum">Forum of support for new Libris</a>
              </li>
              <li class="item">
                <a class="Footer-link js-translateable" href="http://www.kb.se/libris/kontakta/" data-translateable="Libris customer service" role="link" alt="Libris customer service">Libris customer service</a>
              </li>
            </ul>
          </li>

          <li class="social-media Footer-contentItem">
            <h4 id="SocialMediaList" class="Footer-listTitle js-translateable" data-translateable="Social media">Social media</h4>
            <ul class="Footer-linkList Footer-linkList--socialMedia" aria-labelledby="SocialMediaList">
              <li class="Footer-linkItem">
                <a class="Footer-link" href="https://www.youtube.com/user/KunglBiblioteket/" alt="National Library of Sweden on Youtube" role="link">
                  <i class="fa fa-2x fa-youtube-play" aria-hidden="true"></i>
                </a>
              </li>
              <li class="Footer-linkItem">
                <a class="Footer-link" href="https://twitter.com/librisnytt/" alt="LibrisNytt on Twitter" role="link">
                  <i class="fa fa-2x fa-twitter-square" aria-hidden="true"></i>
                </a>
              </li>
              <li class="Footer-linkItem">
                <a class="Footer-link" href="https://www.facebook.com/LibrisNytt/" alt="LibrisNytt on Facebook" role="link">
                  <i class="fa fa-2x fa-facebook-square" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
  </footer>
</template>

<style lang="less">

.Footer {
  padding: 20px 0;
  background-color: @bg-footer;
  border: 0px solid @border-footer;
  color: @text-footer;
  box-shadow: @shadow-footer;

  &-content {
    display: flex;
    justify-content: center; 
  }

  &-serviceName {
    display: flex;
    padding: 0 1em;
    flex: 20% 1 1;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    font-weight: bold;
  }

  &-contentList {
    display: flex;
    list-style-type: none;
    flex: 80% 2 2;
  }

  &-contentItem {
    flex: 25% 2 2;
    flex-direction: column;
  }

  &-linkList {
    font-size: 14px;
    font-size: 1.4rem;
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  &-linkItem {

    .Footer-linkList--socialMedia & {
       display: inline;
       margin: 0 5px;
    }
  }

  &-link {
    color: @text-footer;
    text-transform:none;
    &:hover {
      color: @text-footer;
    }
  }

  &-listTitle {
    font-size: 16px;
    font-size: 1.6rem;
    margin: 5px 0;
  }

  i {
    color: @text-alt-footer;
  }
}

</style>
