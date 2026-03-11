import { offerTimeoutWorker } from "@/dispatch/offerTimeoutWorker"

setInterval(() => {
  offerTimeoutWorker()
}, 3000)