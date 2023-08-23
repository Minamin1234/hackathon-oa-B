<script setup>
import { inject } from "vue"
import { useRouter } from "vue-router"

const message = inject("message")

const router = useRouter()
const onClick = () => {
  router.push({ name: "home" })
}
</script>

<template>
  <div>{{ message }}</div>
  <button type="button" @click="onClick" >戻る</button>
</template>