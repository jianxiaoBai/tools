<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>
<script>
import axios from "axios";
export default {
  mounted() {
    // GET request for remote image
    axios({
      method: "get",
      url: "http://127.0.0.1:3000",
      params: {
        language: 'ne',
        value: '你好'
      }
    }).then(function(res) {
      console.log(res);
    });

  }
};
</script>
