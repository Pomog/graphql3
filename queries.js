import { queryFetch } from "./fetch.js";

export async function getId(userId) {
	const data = await queryFetch(
		`
		query getId($user: String){
		    user(where: { login: { _eq: $user }}){
		        id,
				login
		    }
		}
		`,
		{ user: userId }
	);
	return data.data.user[0];
}

export async function div01CompletedTasksID(username) {
	const data = await queryFetch(
		`
        query getDiv01CompletedTasksID($username: String){
            user(where: { login: { _eq: $username } }) {
                login
                progresses(where: {_and: [{path: {_iregex: "div-01/(?!piscine-js.*/)"} _and: {path: {_iregex: "div-01/(?!rust)"}}}, {isDone: {_eq: true}}]}) {
                    path
                    object {
                        id
                    }
                }
            }
        }`,
		{ username: username }
	);
	return data;
}

export async function div01TaskXP(username, taskID) {
	const data = await queryFetch(
		`
        query getDiv01TaskXP($username: String, $objectid: Int){
            user(where: {login: {_eq: $username}}) {
                id
                login
                transactions(where: {_and: [{objectId: {_eq: $objectid}}]}, order_by: {amount: desc}, distinct_on: amount, limit: 1) {
                    amount
                    createdAt
                    object {
                        name
                    }
                }
            }
        }`,
		{ username: username, objectid: taskID }
	);
	return data;
}
