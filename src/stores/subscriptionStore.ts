import {defineStore} from "pinia";
import {
  cardOutline,
  cloudOutline,
  logoFigma,
  musicalNotesOutline,
  playCircleOutline,
  radioOutline
} from "ionicons/icons";

export const subscriptionStore = defineStore("subscriptions", {
  state: () => ({
    subscriptions: [
      {
        id: 1,
        colorClass: "green",
        date: "19 сентября",
        icon: playCircleOutline,
        name: "YouTube Premium",
        period: "месяц",
        isActive: true,
        price: 399,
        category: {
          id: 1,
          name: "Видео"
        }
      },
      {
        id: 2,
        colorClass: "blue",
        date: "22 сентября",
        icon: radioOutline,
        name: "Яндекс Плюс",
        period: "месяц",
        isActive: true,
        price: 299,
        category: {
          id: 2,
          name: "Музыка"
        }
      },
      {
        id: 3,
        colorClass: "violet",
        date: "28 сентября",
        icon: cloudOutline,
        name: "iCloud+",
        period: "месяц",
        isActive: true,
        price: 149,
        category: {
          id: 3,
          name: "Облако"
        }
      },
      {
        id: 4,
        colorClass: "orange",
        date: "3 октября",
        icon: musicalNotesOutline,
        name: "Spotify",
        period: "месяц",
        isActive: true,
        price: 219,
        category: {
          id: 2,
          name: "Музыка"
        }
      },
      {
        id: 5,
        colorClass: "red",
        date: "7 октября",
        icon: cardOutline,
        name: "Netflix",
        period: "месяц",
        isActive: true,
        price: 899,
        category: {
          id: 1,
          name: "Видео"
        }
      },
      {
        id: 6,
        colorClass: "cyan",
        date: "12 октября",
        icon: logoFigma,
        name: "Figma Professional",
        period: "месяц",
        isActive: true,
        price: 990,
        category: {
          id: 4,
          name: "Работа"
        }
      }
    ] as Subscription[],
    categories: [
      {
        id: 1,
        name: "Видео"
      },
      {
        id: 2,
        name: "Музыка"
      },
      {
        id: 3,
        name: "Облако"
      },
      {
        id: 4,
        name: "Работа"
      }
    ]
  }),
  getters: {
    getSubscriptions: (state) => state.subscriptions
  },
  actions: {
    sumSubscriptions() {
      return this.subscriptions
        .map((item) => item.price)
        .reduce((accumulator, currentValue) => {
          return accumulator + currentValue;
        });
    }
  }
});
