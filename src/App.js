import React, { useEffect, useState } from "react";
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import { Query, ApolloProvider } from "react-apollo";
import "./App.css";

const client = new ApolloClient({ uri: `https://hupra.dk/miniproject/graphql` });

const ALL_USERS = gql`
	{
		getAllUsers {
			firstName
			lastName
			email
			password
		}
	}
`;

function App() {
	let [u, setU] = useState({
		userName: "kurtw",
		firstName: "kurt",
		lastName: "wonnegut",
		email: "kurt@mailen.dk",
		password: "123"
	});
	const [users, setUsers] = useState([]);
	let [mewant, setMewant] = useState(["userName", "id"]);
	const [feedback, setFeedback] = useState(false);

	useEffect(() => getAllUsers(), []);

	async function getAllUsers() {
		console.log("bah");
		const ALL_USERS2 = gql`
			{
				getAllUsers {
					${mewant.join(" ")}
				}
			}
		`;
		const response = await client.query({
			query: ALL_USERS2,
			fetchPolicy: "no-cache"
		});
		const { data, loading, error } = response;

		console.log(data.getAllUsers);
		setUsers(data.getAllUsers);
	}

	const handleCheckbox = e => {
		const checked = e.target.checked;
		const value = e.target.value;

		if (checked) mewant.push(value);
		else mewant = mewant.filter(e => e !== value);

		setMewant(mewant);

		getAllUsers();
	};

	const updateUser = e => {
		const name = e.target.name;
		const value = e.target.value;

		u[name] = value;

		setU({ ...u });
	};

	const resetUsers = async () => {
		const QUERY = gql`
			mutation {
				resetUsers
			}
		`;

		await client.mutate({ mutation: QUERY });

		setTimeout(() => {
			getAllUsers();
		}, 50);
	};

	const addUser = async e => {
		e.preventDefault();

		const ADD_USER = gql`
			mutation($user: UserInput!) {
				addUser(input: $user) {
					id
				}
			}
		`;

		const response = await client.mutate({
			mutation: ADD_USER,
			variables: { user: u }
		});
		const newUser = response.data.addUser;

		let msg = "Username already in use";
		if (newUser) msg = "new users id: " + newUser.id;

		setFeedback(msg);
		getAllUsers();
	};

	return (
		<ApolloProvider client={client}>
			<div className="App container">
				<UserTable users={users} />
				<hr />
				<button className="btn btn-danger" onClick={resetUsers}>
					Reset users
				</button>
				<hr />
				<CheckBoxes handleCheckbox={handleCheckbox} />
				<TheForm
					u={u}
					updateUser={updateUser}
					addUser={addUser}
					feedback={feedback}
				/>
			</div>
		</ApolloProvider>
	);
}

function UserTable({ users }) {
	if (users.length === 0) return "No data found";

	const keys = Object.keys(users[0])
		.slice(0, -1)
		.map(e => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase());

	return (
		<table className="table">
			<thead>
				<tr>
					{keys.map(key => (
						<th key={key}>{key}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{users.map(user => (
					<tr key={JSON.stringify(user)}>
						{Object.keys(user)
							.slice(0, -1)
							.map(ukey => (
								<td key={ukey}>{user[ukey]}</td>
							))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

function CheckBoxes({ handleCheckbox }) {
	return (
		<>
			<di>
				<input type="checkbox" value="email" onChange={handleCheckbox} />
				<label>email</label>
				<br />
				<input type="checkbox" value="firstName" onChange={handleCheckbox} />
				<label>firstName</label>
				<br />
				<input type="checkbox" value="lastName" onChange={handleCheckbox} />
				<label>lastName</label>
				<br />
				<input type="checkbox" value="userName" onChange={handleCheckbox} />
				<label>userName</label>
			</di>
		</>
	);
}

function TheForm({ u, updateUser, addUser, feedback }) {
	return (
		<>
			<hr />
			<h3>Make new user</h3>
			<form className="row" onSubmit={addUser}>
				<div className="col-sm-6">
					<div className="form-group">
						<label>Username</label>
						<input
							type="text"
							className="form-control"
							placeholder="Enter username"
							name="userName"
							value={u.userName}
							onChange={updateUser}
							required
						/>
					</div>
				</div>
				<div className="col-sm-6">
					<div className="form-group">
						<label>Email address</label>
						<input
							type="email"
							className="form-control"
							placeholder="Enter email"
							name="email"
							value={u.email}
							onChange={updateUser}
							required
						/>
					</div>
				</div>

				<div className="col-sm-6">
					<div className="form-group">
						<label>Firstname</label>
						<input
							type="text"
							className="form-control"
							placeholder="Enter firstname"
							name="firstName"
							value={u.firstName}
							onChange={updateUser}
							required
						/>
					</div>
				</div>

				<div className="col-sm-6">
					<div className="form-group">
						<label>Lastname</label>
						<input
							type="test"
							className="form-control"
							placeholder="Enter lastname"
							name="lastName"
							value={u.lastName}
							onChange={updateUser}
							required
						/>
					</div>
				</div>

				<div className="col-sm-6">
					<div className="form-group">
						<label>Password</label>
						<input
							type="password"
							className="form-control"
							placeholder="Password"
							name="password"
							value={u.password}
							onChange={updateUser}
							required
						/>
					</div>
				</div>

				{feedback && <div className="col-sm-12">{feedback}</div>}

				<div className="col-sm-12">
					<div className="form-group">
						<br />
						<button className="btn btn-primary">Submit</button>
					</div>
				</div>
			</form>
		</>
	);
}

export default App;
