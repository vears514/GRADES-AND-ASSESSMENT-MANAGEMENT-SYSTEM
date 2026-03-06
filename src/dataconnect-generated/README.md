# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListTerms*](#listterms)
  - [*ListGradesByStudentAndTerm*](#listgradesbystudentandterm)
- [**Mutations**](#mutations)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListTerms
You can execute the `ListTerms` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listTerms(): QueryPromise<ListTermsData, undefined>;

interface ListTermsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTermsData, undefined>;
}
export const listTermsRef: ListTermsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTerms(dc: DataConnect): QueryPromise<ListTermsData, undefined>;

interface ListTermsRef {
  ...
  (dc: DataConnect): QueryRef<ListTermsData, undefined>;
}
export const listTermsRef: ListTermsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTermsRef:
```typescript
const name = listTermsRef.operationName;
console.log(name);
```

### Variables
The `ListTerms` query has no variables.
### Return Type
Recall that executing the `ListTerms` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTermsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListTermsData {
  terms: ({
    id: string;
    name: string;
    startDate: TimestampString;
    endDate: TimestampString;
  } & Term_Key)[];
}
```
### Using `ListTerms`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTerms } from '@dataconnect/generated';


// Call the `listTerms()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTerms();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTerms(dataConnect);

console.log(data.terms);

// Or, you can use the `Promise` API.
listTerms().then((response) => {
  const data = response.data;
  console.log(data.terms);
});
```

### Using `ListTerms`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTermsRef } from '@dataconnect/generated';


// Call the `listTermsRef()` function to get a reference to the query.
const ref = listTermsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTermsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.terms);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.terms);
});
```

## ListGradesByStudentAndTerm
You can execute the `ListGradesByStudentAndTerm` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listGradesByStudentAndTerm(vars: ListGradesByStudentAndTermVariables): QueryPromise<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;

interface ListGradesByStudentAndTermRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListGradesByStudentAndTermVariables): QueryRef<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;
}
export const listGradesByStudentAndTermRef: ListGradesByStudentAndTermRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listGradesByStudentAndTerm(dc: DataConnect, vars: ListGradesByStudentAndTermVariables): QueryPromise<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;

interface ListGradesByStudentAndTermRef {
  ...
  (dc: DataConnect, vars: ListGradesByStudentAndTermVariables): QueryRef<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;
}
export const listGradesByStudentAndTermRef: ListGradesByStudentAndTermRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listGradesByStudentAndTermRef:
```typescript
const name = listGradesByStudentAndTermRef.operationName;
console.log(name);
```

### Variables
The `ListGradesByStudentAndTerm` query requires an argument of type `ListGradesByStudentAndTermVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListGradesByStudentAndTermVariables {
  studentId: string;
  termId: string;
}
```
### Return Type
Recall that executing the `ListGradesByStudentAndTerm` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListGradesByStudentAndTermData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListGradesByStudentAndTermData {
  grades: ({
    studentId: string;
    termId: string;
    subjectCode: string;
    subjectTitle: string;
    units: number;
    instructorName: string;
    gradeValue: string;
    remarks?: string | null;
    status: string;
    publishedAt?: TimestampString | null;
    publishedBy?: string | null;
  })[];
}
```
### Using `ListGradesByStudentAndTerm`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listGradesByStudentAndTerm, ListGradesByStudentAndTermVariables } from '@dataconnect/generated';

// The `ListGradesByStudentAndTerm` query requires an argument of type `ListGradesByStudentAndTermVariables`:
const listGradesByStudentAndTermVars: ListGradesByStudentAndTermVariables = {
  studentId: ..., 
  termId: ..., 
};

// Call the `listGradesByStudentAndTerm()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listGradesByStudentAndTerm(listGradesByStudentAndTermVars);
// Variables can be defined inline as well.
const { data } = await listGradesByStudentAndTerm({ studentId: ..., termId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listGradesByStudentAndTerm(dataConnect, listGradesByStudentAndTermVars);

console.log(data.grades);

// Or, you can use the `Promise` API.
listGradesByStudentAndTerm(listGradesByStudentAndTermVars).then((response) => {
  const data = response.data;
  console.log(data.grades);
});
```

### Using `ListGradesByStudentAndTerm`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listGradesByStudentAndTermRef, ListGradesByStudentAndTermVariables } from '@dataconnect/generated';

// The `ListGradesByStudentAndTerm` query requires an argument of type `ListGradesByStudentAndTermVariables`:
const listGradesByStudentAndTermVars: ListGradesByStudentAndTermVariables = {
  studentId: ..., 
  termId: ..., 
};

// Call the `listGradesByStudentAndTermRef()` function to get a reference to the query.
const ref = listGradesByStudentAndTermRef(listGradesByStudentAndTermVars);
// Variables can be defined inline as well.
const ref = listGradesByStudentAndTermRef({ studentId: ..., termId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listGradesByStudentAndTermRef(dataConnect, listGradesByStudentAndTermVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.grades);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.grades);
});
```

# Mutations

No mutations were generated for the `example` connector.

If you want to learn more about how to use mutations in Data Connect, you can follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

