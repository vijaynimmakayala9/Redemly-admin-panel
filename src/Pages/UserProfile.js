// src/pages/UserProfile.jsx

import { useParams } from "react-router-dom";
import {
  Container,
  Table,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
} from "reactstrap";

// Dummy user data
const dummyUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    mobile: "1234567890",
    age: 30,
    gender: "Male",
    dob: "1994-01-01",
    profileImage:
      "https://img.freepik.com/premium-photo/girl-happy-portrait-user-profile-by-ai_1119669-10.jpg",
    location: "New York",
    created_at: "2025-01-01",
    coupons: [
      {
        code: "NEWYEAR2025",
        redeemed: true,
        redeemedOn: "2025-01-01",
        discount: "20%",
        reward: "100 coins",
      },
      {
        code: "WELCOME50",
        redeemed: false,
        redeemedOn: null,
        discount: "50%",
        reward: "50 coins",
      },
    ],
    activities: [
      { activity: "Logged in", timestamp: "2025-06-01 10:00 AM" },
      { activity: "Redeemed coupon", timestamp: "2025-06-01 10:30 AM" },
    ],
    couponTransfers: [
      {
        code: "FREEDINE",
        sender: "John Doe",
        receiver: "Jane Smith",
        reward: "Free Dinner",
        transferredOn: "2025-05-10",
      },
    ],
    coins: {
      total: 500,
      createdOn: "2025-01-01",
      updatedOn: "2025-06-01",
    },
    spinWheel: [
      {
        spinDate: "2025-04-15",
        reward: "20 coins",
        outcome: "Win",
      },
    ],
    referrals: [
      {
        referredUser: "Mike Ross",
        date: "2025-03-20",
        rewarded: true,
        reward: "50 coins",
      },
    ],
    eventLogs: [
      {
        type: "Login",
        data: "User logged in from IP 192.168.1.1",
        created: "2025-06-01 10:00 AM",
      },
    ],
    feedbacks: [
      {
        to: "App UI",
        feedback: "Very user-friendly!",
        date: "2025-05-05",
      },
    ],
  },
];

export default function UserProfile() {
  const { id } = useParams();
  const user = dummyUsers.find((u) => u.id === parseInt(id));

  if (!user) return <Container className="mt-4">User not found</Container>;

  return (
    <Container className="my-5">
      <Card>
        <CardBody>
          {/* Profile Section */}
          <Row className="mb-4">
            <Col md="4" className="text-center">
              <img
                src={user.profileImage}
                alt="Profile"
                className="img-thumbnail rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </Col>
            <Col md="8">
              <CardTitle tag="h4" className="mb-4">
                User Details
              </CardTitle>
              <Table bordered responsive>
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{user.name}</td>
                    <th>Email</th>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <th>Mobile</th>
                    <td>{user.mobile}</td>
                    <th>Gender</th>
                    <td>{user.gender}</td>
                  </tr>
                  <tr>
                    <th>Age</th>
                    <td>{user.age}</td>
                    <th>Date of Birth</th>
                    <td>{user.dob}</td>
                  </tr>
                  <tr>
                    <th>Location</th>
                    <td>{user.location}</td>
                    <th>Created At</th>
                    <td>{user.created_at}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* User Activity */}
          <CardTitle tag="h5" className="mt-5 mb-3">User Activity</CardTitle>
          <Table bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Activity</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {user.activities.map((a, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{a.activity}</td>
                  <td>{a.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Coupons */}
          <CardTitle tag="h5" className="mt-5 mb-3">Coupon Details</CardTitle>
          <Table bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Redeemed On</th>
              </tr>
            </thead>
            <tbody>
              {user.coupons.map((coupon, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{coupon.code}</td>
                  <td>{coupon.discount}</td>
                  <td>{coupon.reward}</td>
                  <td>
                    {coupon.redeemed ? (
                      <span className="text-success">Redeemed</span>
                    ) : (
                      <span className="text-warning">Not Redeemed</span>
                    )}
                  </td>
                  <td>{coupon.redeemedOn || "—"}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Coupon Transfers */}
          <CardTitle tag="h5" className="mt-5 mb-3">Coupon Transfers</CardTitle>
          <Table bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Coupon Code</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Reward</th>
                <th>Transferred On</th>
              </tr>
            </thead>
            <tbody>
              {user.couponTransfers.map((t, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{t.code}</td>
                  <td>{t.sender}</td>
                  <td>{t.receiver}</td>
                  <td>{t.reward}</td>
                  <td>{t.transferredOn}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Coins Info */}
          <CardTitle tag="h5" className="mt-5 mb-3">Coins Information</CardTitle>
          <Table bordered responsive>
            <tbody>
              <tr>
                <th>Total Coins</th>
                <td>{user.coins.total}</td>
                <th>Created On</th>
                <td>{user.coins.createdOn}</td>
              </tr>
              <tr>
                <th>Last Updated</th>
                <td colSpan="3">{user.coins.updatedOn}</td>
              </tr>
            </tbody>
          </Table>

          {/* Spin Wheel */}
          <CardTitle tag="h5" className="mt-5 mb-3">Spin Wheel History</CardTitle>
          <Table bordered responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Reward</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {user.spinWheel.map((spin, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{spin.spinDate}</td>
                  <td>{spin.reward}</td>
                  <td>{spin.outcome}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Referrals */}
          <CardTitle tag="h5" className="mt-5 mb-3">Referral Details</CardTitle>
          <Table bordered responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Referred User</th>
                <th>Date</th>
                <th>Rewarded</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody>
              {user.referrals.map((ref, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{ref.referredUser}</td>
                  <td>{ref.date}</td>
                  <td>{ref.rewarded ? "Yes" : " No"}</td>
<td>{ref.reward}</td>
</tr>
))}
</tbody>
</Table>

      {/* Event Logs */}
      <CardTitle tag="h5" className="mt-5 mb-3">Event Logs</CardTitle>
      <Table bordered responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Event Type</th>
            <th>Event Data</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {user.eventLogs.map((event, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{event.type}</td>
              <td>{event.data}</td>
              <td>{event.created}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Feedbacks */}
      <CardTitle tag="h5" className="mt-5 mb-3">Feedback Given</CardTitle>
      <Table bordered responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>To</th>
            <th>Feedback</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {user.feedbacks.map((fb, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{fb.to}</td>
              <td>{fb.feedback}</td>
              <td>{fb.date}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </CardBody>
  </Card>
</Container>
);
}