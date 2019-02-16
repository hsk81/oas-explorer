const is_array
    = (a) => a instanceof Array;
const is_object
    = (o) => o instanceof Object;

const key_default
    = (p, k) => `${p}/${k}`;
const value_default
    = (p, k) => v;

const walk = (any, path = "") => ({ key, value }) => {
    const get_key =
        key !== undefined ? key : key_default;
    const get_value =
        value !== undefined ? value : value_default;
    if (is_object(any)) {
        return Object.entries(any)
            .map(([k, v]) => [
                k, walk(v, get_key(path, k))({
                    key: get_key, value: get_value
                })
            ])
            .reduce((acc, [k, v]) => {
                acc[k] = v; return acc;
            }, is_array(any) ? [] : {});
    }
    return get_value(path, any);
};

exports.walk = walk;
