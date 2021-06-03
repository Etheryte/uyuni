import moment from "moment";

type LocalTime = typeof moment & {
  __localTime: true;
};

type ServerMomentType = ReturnType<typeof moment> & {
  readonly __serverTime: true;
  format(): void;
};

function ServerMoment(...args: Parameters<typeof moment>): ServerMomentType {
  const instance = moment(...args);
  return Object.assign(instance, {
    get __serverTime() {
      return true as true;
    },
    format() {
        throw new TypeError("Don't use server time for displaying");
    }
  });
}
