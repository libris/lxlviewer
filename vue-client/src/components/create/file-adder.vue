<script>
import * as LxlDataUtil from 'lxljs/data';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'file-adder',
  data() {
    return {
      userIsDropping: false,
      invalidFile: false,
      droppedFile: {},
    };
  },
  props: {
    type: {
      type: String,
      default: 'new',
    },
  },
  emits: ['output'],
  methods: {
    translatePhrase,
    outputData(data) {
      this.$emit('output', data);
    },
    openPicker() {
      this.$refs.FilePicker.click();
    },
    initFilePicker() {
      const self = this;
      this.$refs.FilePicker.addEventListener('input', (e) => {
        const reader = new FileReader();
        reader.onloadend = function insertDropped(event) {
          try {
            const res = event.target.result;
            const data = JSON.parse(res);
            self.droppedFile = data;
          } catch (error) {
            self.invalidFile = true;
            console.log(error);
          }
        };
        reader.readAsText(e.target.files[0]);
      });
    },
    initDropzone() {
      window.addEventListener('dragover', (e) => {
        e.preventDefault();
      }, false);
      window.addEventListener('drop', (e) => {
        e.preventDefault();
      }, false);
      const self = this;
      this.$refs.dropzone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        self.userIsDropping = true;
      });
      this.$refs.dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        self.userIsDropping = false;
      });
      this.$refs.dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        const reader = new FileReader();
        reader.onloadend = function insertDropped(event) {
          try {
            const res = event.target.result;
            const data = JSON.parse(res);
            self.droppedFile = data;
          } catch (error) {
            self.invalidFile = true;
            console.log(error);
          }
        };
        reader.readAsText(e.dataTransfer.files[0]);
      });
    },
  },
  events: {
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
  },
  components: {
  },
  watch: {
    droppedFile(val) {
      if (val.hasOwnProperty('@graph')) {
        const inspectorObject = LxlDataUtil.splitJson(val);
        this.outputData(inspectorObject);
      } else {
        this.invalidFile = true;
      }
    },
    invalidFile(val) {
      if (val === true) {
        setTimeout(() => {
          this.invalidFile = false;
          this.userIsDropping = false;
        }, 3000);
      }
    },
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.initDropzone();
      this.initFilePicker();
    });
  },
};
</script>

<template>
  <div class="FileAdder">
    <div class="alert alert-info" v-if="type === 'new'">
      Notera att denna funktion automatiskt rensar och byter ut vissa värden som inte ska tas med till den nya posten.
      Till detta hör bland annat en posts ID, information om vem som skapat posten och när den skapades.
    </div>
    <div class="alert alert-danger" v-if="type === 'overwrite'">
      Denna funktion förbereder formuläret för att <strong>skriva över en post</strong>.
      Om du vill skapa en ny post istället, välj "Från fil" i menyn ovan.<br><br>
      Notera att interna @ID-värden behöver matcha posten du vill skriva över.<br>
      Du behöver även spara posten i nästa steg för att operationen ska slutföras.
    </div>
    <button
      class="btn btn-primary btn--lg"
      @click="openPicker">{{ translatePhrase('Choose file') }}</button>
    <input
      type="file"
      class="FilePicker"
      ref="FilePicker"
      accept=".jsonld,application/ld+json,text/*"
      aria-labelledby="Dropzone-description" />
    <hr />{{ translatePhrase('or') }}<hr />
    <div class="Dropzone" :class="{ 'is-active': userIsDropping, 'is-invalid': invalidFile }">
      <div class="Dropzone-mask" ref="dropzone" />
      <div class="Dropzone-container">
        <div
          id="Dropzone-description"
          class="Dropzone-description"
          v-if="!invalidFile">{{ translatePhrase('Drop your file here') }}</div>
        <div
          id="Dropzone-description"
          class="Dropzone-description"
          v-else-if="invalidFile">{{ translatePhrase('Invalid file') }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.FileAdder {
  border: 1px solid @form-border;
  background-color: @white;
  display: flex;
  padding: 1em;
  flex-direction: column;
  align-items: center;
  p {
    margin-bottom: 2em;
  }
  .FilePicker {
    width: 1px;
    height: 1px;
    opacity: 0;
  }
  hr {
    display: inline-block;
    width: 25%;
  }
  .Dropzone {
    border: 3px solid @grey;
    border-radius: 1em;
    height: 25vh;
    width: 80%;
    &.is-active {
      background-color: fadeout(@brand-primary, 50%);
      border: 3px dashed @brand-primary;
    }
    &.is-invalid {
      background-color: fadeout(@brand-danger, 50%);
      border: 3px dashed @brand-danger;
    }
    &-title {
      font-size: 24px;
      font-size: 2.4rem;
      font-weight: 500;
    }
    &-container {
      display: flex;
      position: relative;
      top: -102%;
      flex-direction: row;
      align-items: center;
      height: inherit;
    }
    &-description {
      text-align: center;
      width: 100%;
    }
    &-mask {
      position: relative;
      width: inherit;
      height: inherit;
      z-index: 999;
      background-color: rgba(0, 0, 0, 0);
    }
  }
}
</style>
