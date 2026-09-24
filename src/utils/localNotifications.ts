import {Capacitor} from "@capacitor/core";
import {
  LocalNotifications,
  type LocalNotificationSchema
} from "@capacitor/local-notifications";
import {
  MS_IN_DAY,
  addPeriod,
  formatShortDate,
  getNextPaymentDate,
  getRegistrationDate,
  toDateOnly
} from "@/utils/subscriptionBilling";

const DEFAULT_CHANNEL_ID = "subly-subscriptions";
const NOTIFICATION_GROUP = "subly-subscription-expiration";
const NOTIFICATION_ID_OFFSET = 100000;
const NOTIFICATION_ID_LIMIT = 2147483647;
const NOTIFICATION_HOUR = 9;

const ensureLocalNotificationsReady = async () => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  if (Capacitor.getPlatform() === "android") {
    await LocalNotifications.createChannel({
      description: "Основные уведомления Subly",
      id: DEFAULT_CHANNEL_ID,
      importance: 4,
      lights: true,
      name: "Subly",
      vibration: true,
      visibility: 1
    });
  }

  let permission = await LocalNotifications.checkPermissions();

  if (permission.display === "prompt") {
    permission = await LocalNotifications.requestPermissions();
  }

  return permission.display === "granted";
};

const getSubscriptionNotificationId = (subscriptionId: number) => {
  const normalizedId = Math.trunc(Math.abs(subscriptionId));
  const availableIds = NOTIFICATION_ID_LIMIT - NOTIFICATION_ID_OFFSET;

  return NOTIFICATION_ID_OFFSET + (normalizedId % availableIds);
};

const getExpirationDate = (subscription: Subscription) => {
  if (!subscription.isActive) {
    return null;
  }

  if (subscription.period === "разовая") {
    const registrationDate = toDateOnly(getRegistrationDate(subscription));

    return addPeriod(
      registrationDate,
      {
        amount: 1,
        unit: "months"
      },
      registrationDate.getDate()
    );
  }

  return getNextPaymentDate(subscription);
};

const getNotificationDate = (
  expirationDate: Date,
  reminderDays: number,
  currentDate = new Date()
) => {
  const daysBeforeExpiration = Math.max(0, Math.trunc(reminderDays));
  const notificationDate = new Date(
    expirationDate.getTime() - daysBeforeExpiration * MS_IN_DAY
  );

  notificationDate.setHours(NOTIFICATION_HOUR, 0, 0, 0);

  if (notificationDate <= currentDate) {
    const fallbackDate = new Date(expirationDate);

    fallbackDate.setHours(NOTIFICATION_HOUR, 0, 0, 0);

    if (fallbackDate <= currentDate) {
      const immediateDate = new Date(currentDate);

      immediateDate.setMinutes(immediateDate.getMinutes() + 1);

      return toDateOnly(currentDate).getTime() ===
        toDateOnly(expirationDate).getTime()
        ? immediateDate
        : null;
    }

    return fallbackDate;
  }

  return notificationDate;
};

const buildNotification = (
  subscription: Subscription,
  currentDate = new Date()
): LocalNotificationSchema | null => {
  const expirationDate = getExpirationDate(subscription);

  if (!expirationDate) {
    return null;
  }

  const notificationDate = getNotificationDate(
    expirationDate,
    subscription.reminderDays ?? 0,
    currentDate
  );

  if (!notificationDate) {
    return null;
  }

  return {
    autoCancel: true,
    body: `${subscription.name}: срок истекает ${formatShortDate(expirationDate)}.`,
    channelId: DEFAULT_CHANNEL_ID,
    extra: {
      source: NOTIFICATION_GROUP,
      subscriptionId: subscription.id
    },
    foreground: true,
    group: NOTIFICATION_GROUP,
    id: getSubscriptionNotificationId(subscription.id),
    isExactNotification: false,
    schedule: {
      allowWhileIdle: true,
      at: notificationDate
    },
    title: "Скоро списание подписки"
  };
};

const cancelExistingSubscriptionNotifications = async () => {
  const pendingNotifications = await LocalNotifications.getPending();
  const notifications = pendingNotifications.notifications.filter(
    (notification) => {
      return (
        notification.extra?.source === NOTIFICATION_GROUP ||
        notification.id >= NOTIFICATION_ID_OFFSET
      );
    }
  );

  if (notifications.length === 0) {
    return;
  }

  await LocalNotifications.cancel({
    notifications: notifications.map((notification) => {
      return {
        id: notification.id
      };
    })
  });
};

export const scheduleSubscriptionExpirationNotifications = async (
  subscriptions: Subscription[]
) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const notifications = subscriptions
    .map((subscription) => {
      return buildNotification(subscription);
    })
    .filter((notification): notification is LocalNotificationSchema => {
      return notification !== null;
    });

  await cancelExistingSubscriptionNotifications();

  if (notifications.length === 0) {
    return;
  }

  const canShowNotifications = await ensureLocalNotificationsReady();

  if (!canShowNotifications) {
    return;
  }

  await LocalNotifications.schedule({
    notifications
  });
};
