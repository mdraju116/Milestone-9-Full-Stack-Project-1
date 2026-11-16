/* 


https://better-auth.com/docs/plugins/admin#list-users

List Users
Allows an admin to list all users in the database.


const { data: users, error } = await authClient.admin.listUsers({
    query: {
        searchValue: "some name", // The value to search for.
        searchField: "name", // The field to search in, defaults to email. Can be `email` or `name`.
        searchOperator: "contains", // The operator to use for the search. Can be `contains`, `starts_with` or `ends_with`.
        limit: 100, // The number of users to return. Defaults to 100.
        offset: 100, // The offset to start from.
        sortBy: "name", // The field to sort by.
        sortDirection: "desc", // The direction to sort by.
        filterField: "email", // The field to filter by.
        filterValue: "hello@example.com", // The value to filter by.
        filterOperator: "eq", // The operator to use for the filter.
    },
});






*/