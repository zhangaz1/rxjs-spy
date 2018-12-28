/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/rxjs-spy
 */

import { Observable, Subscriber, Subscription } from "rxjs";
import { identify } from "./identify";
import { getSubscriptionLabel } from "./subscription-label";
import { isObservable } from "./util";

export type MatchPredicate = (value: string | undefined, observable?: Observable<any>) => boolean;
export type Match = Observable<any> | number | string | RegExp | MatchPredicate;

export function matches<T>(observable: Observable<T>, match: Match, value?: string): boolean;
export function matches<T>(observable: Observable<T>, match: Match): boolean;
export function matches(subscription: Subscription, match: Match, value?: string): boolean;
export function matches(subscription: Subscription, match: Match): boolean;
export function matches<T>(arg: Observable<T> | Subscription, match: Match, value?: string): boolean {

    let observable: Observable<T>;
    let subscriber: Subscriber<T> | undefined = undefined;
    let subscription: Subscription | undefined = undefined;

    if (isObservable(arg)) {
        observable = arg;
    } else {
        const subscriptionLabel = getSubscriptionLabel(arg);
        observable = subscriptionLabel.observable;
        subscriber = subscriptionLabel.subscriber;
        subscription = subscriptionLabel.subscription;
    }

    if (isObservable(match)) {
        return observable === match;
    }

    const observableId = identify(observable);
    const subscriberId = subscriber ? identify(subscriber) : undefined;
    const subscriptionId = subscription ? identify(subscription) : undefined;
    const tag = value || read(observable);

    if (typeof match === "function") {
        return match(tag, observable);
    }
    if (typeof match === "number") {
        const text = match.toString();
        return (text === observableId) || (text === subscriberId) || (text === subscriptionId);
    }
    if (typeof match === "string") {
        return (match === observableId) || (match === subscriberId) || (match === subscriptionId) || (match === tag);
    }
    if (tag === undefined) {
        return false;
    }
    return match.test(tag);
}

export function read<T>(observable: Observable<T>): string | undefined {

    const operator = observable["operator"];
    if (!operator) {
        return undefined;
    }

    const tag = operator["tag"];
    if (!tag) {
        return undefined;
    }
    return tag;
}

export function toString(match: Match): string {

    if (isObservable(match)) {
        return "[Observable]";
    } else if (typeof match === "function") {
        return "[Function]";
    }
    return match.toString();
}
