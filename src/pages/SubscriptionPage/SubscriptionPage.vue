<template>
  <PageContainer>
    <section :class="style.header">
      <div>
        <span :class="style.eyebrow">Каталог</span>
        <h1>Подписки</h1>
      </div>

      <ion-button :class="style.addButton" aria-label="Добавить подписку">
        <ion-icon :icon="addOutline" />
      </ion-button>
    </section>

    <section :class="style.summaryCard">
      <div :class="style.summaryTop">
        <span>Активные подписки</span>
        <strong>{{ subscriptions.length }}</strong>
      </div>

      <div :class="style.summaryGrid">
        <div>
          <span>В месяц</span>
          <strong>{{ subscriptionsMonthlyTotal }} ₽</strong>
        </div>

        <div>
          <span>Следующее</span>
          <strong>{{ nextPaymentLabel }}</strong>
        </div>
      </div>
    </section>

    <section :class="style.toolbar" aria-label="Фильтры подписок">
      <ion-input
        v-model="searchQuery"
        :class="style.searchBox"
        clear-input
        placeholder="Поиск подписки"
      >
        <ion-icon slot="start" :icon="searchOutline" />
      </ion-input>

      <ion-button
        fill="clear"
        :class="style.filterButton"
        aria-label="Фильтры"
        @click="openFilterModal"
      >
        <ion-icon :icon="optionsOutline" />
        <span v-if="activeFiltersCount" :class="style.filterBadge">
          {{ activeFiltersCount }}
        </span>
      </ion-button>
    </section>

    <section :class="style.filterChips" aria-label="Категории">
      <button
        :class="[
          style.chip,
          selectedCategory === 'Все' ? style.activeChip : null
        ]"
        @click="selectCurrentCategory('Все')"
      >
        Все
      </button>
      <button
        :class="[
          style.chip,
          selectedCategory === category.name ? style.activeChip : null
        ]"
        v-for="category in categories"
        :key="category.id"
        @click="selectCurrentCategory(category.name)"
      >
        {{ category.name }}
      </button>
    </section>

    <section :class="style.section">
      <div :class="style.sectionHeader">
        <div>
          <span :class="style.eyebrow">Список</span>
          <h2>{{ subscriptionListTitle }}</h2>
        </div>

        <span>По списанию</span>
      </div>

      <div :class="style.subscriptionList">
        <section
          v-for="monthGroup in subscriptionMonthGroups"
          :key="monthGroup.name"
          :class="style.monthGroup"
        >
          <div :class="style.monthHeader">
            <h3>{{ monthGroup.name }}</h3>
            <span>{{ monthGroup.subscriptions.length }}</span>
          </div>

          <SubscriptionCard
            v-for="subscription in monthGroup.subscriptions"
            :key="subscription.id"
            :subscription="subscription"
          />
        </section>

        <p v-if="!subscriptions.length" :class="style.emptyState">
          Подписок не найдено
        </p>
      </div>
    </section>

    <FilterModal
      :categories="categories"
      :is-open="isFilterModalOpen"
      :price-filters="priceFilters"
      :selected-category="selectedCategory"
      :selected-price-filter="selectedPriceFilter"
      :selected-price-filter-label="selectedPriceFilterLabel"
      :subscriptions-count="subscriptions.length"
      @close="closeFilterModal"
      @reset="resetFilters"
      @select-category="selectCurrentCategory"
      @select-price-filter="selectPriceFilter"
    />
  </PageContainer>
</template>

<script lang="ts">
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import SubscriptionCard from "@/components/SubscriptionCard/SubscriptionCard.vue";
import FilterModal from "./components/FilterModal/FilterModal.vue";
import {IonButton, IonIcon, IonInput} from "@ionic/vue";
import {defineComponent} from "vue";
import {addOutline, optionsOutline, searchOutline} from "ionicons/icons";
import style from "./SubscriptionPage.module.scss";

type SubscriptionMonthGroup = {
  name: string;
  order: number;
  subscriptions: Subscription[];
};

type PriceFilterId = "all" | "cheap" | "middle" | "expensive";

type PriceFilter = {
  id: PriceFilterId;
  label: string;
  description: string;
  min: number | null;
  max: number | null;
};

const calendarMonths = [
  {name: "Январь", dateName: "января"},
  {name: "Февраль", dateName: "февраля"},
  {name: "Март", dateName: "марта"},
  {name: "Апрель", dateName: "апреля"},
  {name: "Май", dateName: "мая"},
  {name: "Июнь", dateName: "июня"},
  {name: "Июль", dateName: "июля"},
  {name: "Август", dateName: "августа"},
  {name: "Сентябрь", dateName: "сентября"},
  {name: "Октябрь", dateName: "октября"},
  {name: "Ноябрь", dateName: "ноября"},
  {name: "Декабрь", dateName: "декабря"}
];

const priceFilters: PriceFilter[] = [
  {
    id: "all",
    label: "Любая",
    description: "Без ограничения цены",
    min: null,
    max: null
  },
  {
    id: "cheap",
    label: "До 300 ₽",
    description: "Недорогие подписки",
    min: null,
    max: 300
  },
  {
    id: "middle",
    label: "300-700 ₽",
    description: "Средний диапазон",
    min: 300,
    max: 700
  },
  {
    id: "expensive",
    label: "От 700 ₽",
    description: "Самые дорогие",
    min: 700,
    max: null
  }
];

export default defineComponent({
  name: "SubscriptionPage",
  components: {
    FilterModal,
    IonButton,
    IonIcon,
    IonInput,
    PageContainer,
    SubscriptionCard
  },
  data() {
    return {
      addOutline,
      optionsOutline,
      searchOutline,
      style,
      isFilterModalOpen: false,
      priceFilters,
      searchQuery: "",
      selectedCategory: "Все",
      selectedPriceFilter: "all" as PriceFilterId
    };
  },
  methods: {
    openFilterModal() {
      this.isFilterModalOpen = true;
    },
    closeFilterModal() {
      this.isFilterModalOpen = false;
    },
    selectCurrentCategory(category: string) {
      this.selectedCategory = category;
    },
    selectPriceFilter(priceFilter: PriceFilterId) {
      this.selectedPriceFilter = priceFilter;
    },
    resetFilters() {
      this.selectedCategory = "Все";
      this.selectedPriceFilter = "all";
    },
    getSubscriptionMonth(date: string) {
      const normalizedDate = date.toLowerCase();
      const monthIndex = calendarMonths.findIndex((month) => {
        return normalizedDate.includes(month.dateName);
      });

      return monthIndex === -1
        ? {name: "Без месяца", order: calendarMonths.length}
        : {
            name: calendarMonths[monthIndex].name,
            order: monthIndex
          };
    }
  },
  computed: {
    allSubscriptions() {
      return this.$subscriptionStore.subscriptions;
    },
    subscriptions() {
      const normalizedQuery = this.searchQuery.trim().toLowerCase();

      return this.allSubscriptions.filter((subscription) => {
        const isSelectedCategory =
          this.selectedCategory === "Все" ||
          subscription.category?.name === this.selectedCategory;
        const isSearchMatched =
          !normalizedQuery ||
          subscription.name.toLowerCase().includes(normalizedQuery) ||
          subscription.category?.name.toLowerCase().includes(normalizedQuery);
        const priceFilter = this.selectedPriceFilterConfig;
        const isPriceMatched =
          (!priceFilter.min || subscription.price >= priceFilter.min) &&
          (!priceFilter.max || subscription.price <= priceFilter.max);

        return isSelectedCategory && isSearchMatched && isPriceMatched;
      });
    },
    categories() {
      return this.$subscriptionStore.categories;
    },
    selectedPriceFilterConfig() {
      return (
        this.priceFilters.find((priceFilter) => {
          return priceFilter.id === this.selectedPriceFilter;
        }) ?? this.priceFilters[0]
      );
    },
    selectedPriceFilterLabel() {
      return this.selectedPriceFilterConfig.label;
    },
    activeFiltersCount() {
      return [
        this.selectedCategory !== "Все",
        this.selectedPriceFilter !== "all"
      ].filter(Boolean).length;
    },
    subscriptionMonthGroups() {
      const groups = new Map<string, SubscriptionMonthGroup>();

      this.subscriptions.forEach((subscription) => {
        const month = this.getSubscriptionMonth(subscription.date);
        const currentGroup = groups.get(month.name);

        if (currentGroup) {
          currentGroup.subscriptions.push(subscription);
          return;
        }

        groups.set(month.name, {
          name: month.name,
          order: month.order,
          subscriptions: [subscription]
        });
      });

      return Array.from(groups.values()).sort((firstGroup, secondGroup) => {
        return firstGroup.order - secondGroup.order;
      });
    },
    subscriptionsMonthlyTotal() {
      return this.subscriptions.reduce((total, subscription) => {
        return total + subscription.price;
      }, 0);
    },
    nextPaymentLabel() {
      const nextSubscription = this.subscriptions[0];

      return nextSubscription ? `${nextSubscription.price} ₽` : "—";
    },
    subscriptionListTitle() {
      return this.selectedCategory === "Все"
        ? "Все подписки"
        : this.selectedCategory;
    }
  }
});
</script>
