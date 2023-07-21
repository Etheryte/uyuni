```jsx
import { useState } from "react";

import { localizedMoment } from "utils";

import { fromNow, FromNow } from "./FromNow";
import { DateTimePicker } from "./DateTimePicker";

const [value, setValue] = useState(localizedMoment());

<div>
  <p>value:</p>
  <div>
    <DateTimePicker value={value} onChange={(newValue) => setValue(newValue)} />
  </div>

  <p><code>fromNow</code> function</p>
  <div>
    <pre>{fromNow(value)}</pre>
  </div>

  <p><code>FromNow</code> component with prop value</p>
  <div>
    <FromNow value={value} />
  </div>

  <p><code>FromNow</code> component with child value</p>
  <div>
    <FromNow>{value}</FromNow>
  </div>
</div>
```
