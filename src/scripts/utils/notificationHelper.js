import CONFIG from '../config';

class NotificationHelper {
    static async isPushNotificationSupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }

    static async requestNotificationPermission() {
        if (!(await this.isPushNotificationSupported())) {
            console.error('Push notifications not supported');
            return false;
        }
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    static urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }

    static async getSubscription() {
        if (!(await this.isPushNotificationSupported())) return null;
        try {
            const registration = await navigator.serviceWorker.ready;
            return await registration.pushManager.getSubscription();
        } catch (error) {
            console.error('Error getting subscription:', error);
            return null;
        }
    }

    static async isSubscribed() {
        return !!(await this.getSubscription());
    }

    static async subscribe() {
        if (!(await this.isPushNotificationSupported())) {
            throw new Error('Push notifications not supported');
        }
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User not logged in');

        try {
            const permissionGranted = await this.requestNotificationPermission();
            if (!permissionGranted) throw new Error('Notification permission denied');

            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                const vapidKey = this.urlBase64ToUint8Array(CONFIG.PUSH_NOTIFICATION.VAPID_PUBLIC_KEY);
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidKey,
                });
            }

            const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))));
            const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))));

            const response = await fetch(
                `${CONFIG.BASE_URL}${CONFIG.NOTIFICATION_ENDPOINTS.SUBSCRIBE}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                        keys: { p256dh, auth },
                    }),
                }
            );
            const responseData = await response.json();
            if (responseData.error) throw new Error(responseData.message);

            return responseData;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            throw error;
        }
    }

    static async unsubscribe() {
        if (!(await this.isPushNotificationSupported())) {
            throw new Error('Push notifications not supported');
        }
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User not logged in');

        try {
            const subscription = await this.getSubscription();
            if (!subscription) return { error: false, message: 'Not subscribed' };

            const response = await fetch(
                `${CONFIG.BASE_URL}${CONFIG.NOTIFICATION_ENDPOINTS.UNSUBSCRIBE}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                }
            );
            const responseData = await response.json();

            await subscription.unsubscribe();

            if (responseData.error) throw new Error(responseData.message);

            return responseData;
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            throw error;
        }
    }

    static async updateSubscriptionButton(buttonElement) {
        if (!buttonElement) return;
        try {
            const isSubscribed = await this.isSubscribed();
            if (isSubscribed) {
                buttonElement.innerHTML = '<i class="fas fa-bell-slash"></i> Unsubscribe';
                buttonElement.title = 'Unsubscribe from notifications';
            } else {
                buttonElement.innerHTML = '<i class="fas fa-bell"></i> Subscribe';
                buttonElement.title = 'Subscribe to notifications';
            }
            buttonElement.disabled = false;
        } catch (error) {
            console.error('Error updating subscription button:', error);
            buttonElement.innerHTML = '<i class="fas fa-bell"></i> Notification Error';
            buttonElement.disabled = true;
        }
    }
}

export default NotificationHelper;
