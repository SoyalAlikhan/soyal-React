// Component 1: UserCard
function UserCard({ name, role }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
}

// Component 2: Team — UserCard ko use karta hai
function Team() {
  return (
    <div>
      <UserCard name="Amit" role="Developer" />
      <UserCard name="Priya" role="Designer" />
      <UserCard name="Raj" role="Manager" />
    </div>
  );
}

function Khan() {
  return (
    <> 
    <h3>hello i am Khan</h3>
    <Team />
    </>
  );
}

export default Khan;