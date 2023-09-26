<script>
import { useStatusStore } from '@/stores/status';
import { mapActions } from 'pinia';

export default {
  name: 'notification',
  data() {
    return {
      TTL: 5000,
      shouldShow: false,
    };
  },
  props: ['content'],
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.shouldShow = true;
      }, 1);
      if (!this.content.sticky) {
        setTimeout(() => {
          this.shouldShow = false;
        }, this.TTL - 500);
        setTimeout(() => {
          this.remove();
        }, this.TTL);
      }
    });
  },
  methods: {
    ...mapActions(useStatusStore, ['removeNotification']),
    remove() {
      this.removeNotification(this.content.id);
    },
  },
};
</script>

<template>
  <div class="Notification " @click="remove" role="alert" :class="{
    'Notification--success': content.type === 'success',
    'Notification--info': content.type === 'info',
    'Notification--warning': content.type === 'warning',
    'Notification--error': content.type === 'danger',
    'is-showing': shouldShow
      }">

      <span v-if="content.type === 'danger'" class="fa-stack-2x Notification-iconCont">
        <font-awesome-icon :icon="['fas', 'circle']" class="fa-stack-2x fa-inverse" size="lg"></font-awesome-icon>
        <font-awesome-icon :icon="['fas', 'xmark']" class="fa-stack-1x Notification-icon" size="lg"></font-awesome-icon>
      </span>

      <span v-if="content.type === 'success'" class="fa-stack Notification-iconCont">
        <font-awesome-icon :icon="['fas', 'circle']" class="fa-stack-2x fa-inverse" size="lg"></font-awesome-icon>
        <font-awesome-icon :icon="['fas', 'check']" class="fa-stack-1x Notification-icon" size="lg"></font-awesome-icon>
      </span>

      <span v-if="content.type === 'info'" class="fa-stack Notification-iconCont">
        <font-awesome-icon :icon="['fas', 'circle']" class="fa-stack-2x fa-inverse" size="lg"></font-awesome-icon>
        <font-awesome-icon :icon="['fas', 'info']" class="fa-stack-1x Notification-icon" size="lg"></font-awesome-icon>
      </span>

      {{ content.message }}

      <router-link
        class="Notification-link"
        v-if="content.link && !content.link.external"
        :to="content.link.to"
        :title="content.link.title"
        :target="content.link.newTab ? '_blank' : '' "
      >
        {{ content.link.title }}
        <font-awesome-icon v-if="content.link.newTab" :icon="['fas', 'arrow-up-right-from-square']" aria-hidden="true" />
      </router-link>

      <a
        class="Notification-link"
        v-if="content.link && content.link.external"
        :href="content.link.to" 
        :target="content.link.newTab ? '_blank' : '' "
      >
        {{ content.link.title }}
        <font-awesome-icon v-if="content.link.newTab" :icon="['fas', 'arrow-up-right-from-square']" aria-hidden="true" />
      </a>
  </div>
</template>

<style lang="scss">

$success-color: $brand-primary;
$success-color-text: $white;
$info-color: $white;
$info-color-text: $grey-darker;
$error-color: $brand-danger;
$error-color-text: $white;
$warning-color: $brand-warning;
$warning-color-text: $white;

.Notification {
  background-color: $info-color;
  opacity: 0;
  transition: opacity 0.5s ease;
  width: 100%;
  border-radius: 0.3em;
  padding: 1em;
  margin: 0.5em;
  font-weight: bold;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.6);
  color: $info-color-text;
  .notification-icon {
    color: $info-color;
  }
  
  &-link {
    color: $info-color-text;
    text-decoration: underline;

    .Notification--error & {
      color: $error-color-text;
    }

    .Notification--success & {
      color: $success-color-text;
    }
  }

  &--error {
    background-color: $error-color;
    color: $error-color-text;
    .notification-icon {
      color: $error-color;
    }
  }

  &--success {
    background-color: $success-color;
    color: $success-color-text;
    .notification-icon {
      color: $success-color;
    }
  }

  &--warning {
    background-color: $warning-color;
    color: $warning-color-text;
    .notification-icon {
      color: $warning-color;
    }
  }

  &-icon {
    color: $info-color;

    .Notification--error & {
      color: $error-color;
    }

    .Notification--success & {
      color: $success-color;
    }
  }

  &-iconCont {
    margin-right: 0.5em;
  }

  &.is-showing {
    opacity: 1;
  }
}

</style>
