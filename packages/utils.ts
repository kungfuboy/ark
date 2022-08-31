import * as _ from "lodash";

export const matchplus = (string, reg, clear: false | RegExp = false) => {
  const content = string.match(reg);
  if (!content) {
    return null;
  }
  const len = content.length;
  if (clear) {
    return content.slice(0, len).map((it) => it.replace(clear, ""));
  }
  return content.slice(0, len);
};

export const matchCouple = (string): any => {
  let data = string;
  return (start: string, end: string) => {
    // before
    if (!start || !end) {
      throw new Error("不具有匹配条件");
    }
    let index = string.indexOf(start);
    let count = 0;
    const before = ~index ? string.slice(0, index) : null;
    data = string.substring(index);
    index = 0;
    let stop = false;
    for (let c of data) {
      if (stop) {
        // stop为true说明已经解析到了想要的结果
        continue;
      }
      index++;
      if (c === start) {
        count++;
      }
      if (c === end) {
        count--;
      }
      if (!count) {
        stop = true;
      }
    }
    const main = data.slice(1, index - 1);
    const after = count ? null : data.slice(index);
    // 如果before或after有一项为null，则匹配失败
    // if (before === null) {
    //   throw new Error(`文本${string}匹配不到以${start}开始的字符串`)
    // }
    // if (after === null) {
    //   throw new Error(`文本${string}匹配不到以${end}结束的字符串`)
    // }
    return [before, main, after];
  };
};

export const isEmptyline = (line) => {
  return !line.trim();
};

export const isCommentline = (line) => line.trim().indexOf("//") == 0;

export const parseLine = (string) => {
  let data = string.trim();
  const arr = [];
  const parseDeep = (string, label) => {
    const index = string.indexOf(label);
    if (~index) {
      // 有匹配
      return [string.slice(0, index), string.slice(index + label.length)];
    }
    // 无匹配，原样返回
    return [null, string];
  };
  return (list) => {
    let index = 0;
    let nullCount = 0;
    const length = list.length;
    do {
      const [first, other] = parseDeep(data, list[index]);
      data = other;
      if (first == null) {
        nullCount += 1;
      } else {
        arr.push(first);
        if (nullCount) {
          while (nullCount) {
            arr.push("");
            nullCount -= 1;
          }
        }
      }
      index = index + 1;
    } while (index !== length);
    if (data.trim()) {
      arr.push(data);
    }
    return arr.map((it) => it.trim());
  };
};

export const parseAttr = (string) => {
  const data = string.trim();
  const index = data.indexOf(":");
  if (!index) {
    // 第一位有冒号
    const [key, value] = parseAttr(data.slice(1));
    return [":" + key, value.trim()];
  }
  if (index > 0) {
    return [data.slice(0, index), data.slice(index + 1)];
  }
  return [data, null];
};

export const firstLowerCase = ([first, ...rest]) =>
  first.toLowerCase() + rest.join("");

export const firstUpperCase = ([first, ...rest]) =>
  first.toUpperCase() + rest.join("");

export const splitByLabel = (string) => {
  let _string = string;
  return (label) => {
    const [first, ...other] = _string.split(label);
    _string = other.join(label).trim();
    return [first.trim(), _string];
  };
};

export const isEmptyObject = (data) => {
  return !Object.keys(data).length;
};

export const tryToNumber = (str) => {
  if (!str) {
    return str;
  }
  var n = Number(str);
  return !isNaN(n) ? n : str;
};

export const mapAttr = (data) => {
  const arr = [];
  const keys = Object.keys(data);
  keys.forEach((it) => {
    if (data[it]) {
      arr.push(`${it}="${_.isString(data[it]) ? data[it].trim() : data[it]}"`);
    } else {
      arr.push(`${it}`);
    }
  });
  return arr.join(" ");
};

export const getBeforeSpace = (data) => {
  const _data = _.trimEnd(data);
  return _data.length - data.trim().length;
};

export const random = () => Math.random().toString(36).slice(-6);

export const isRandom = (data: string): boolean => {
  const [b, m, a]: [string | null, string, string | null] = matchCouple(data)(
    "{",
    "}"
  );
  return false;
};
