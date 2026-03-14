import { checkOfferTimeouts } from "@/dispatch/checkOfferTimeouts"


setInterval(() => {
  checkOfferTimeouts()
}, 3000)