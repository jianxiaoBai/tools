<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <div><router-link to="/about">About</router-link></div>
    <div><router-link to="/i18n">I18n</router-link></div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>

<style lang="stylus">
.home
  margin-top 60px
div
  margin 20px
</style>

