
import { useEffect, useState } from "react";
import {
  BedDouble,
  CheckCircle,
  Users,
  IndianRupee,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    activeBookings: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/dashboard`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to fetch dashboard data");
      }

      setStats(data.stats);
    } catch (err) {
      console.error("Dashboard API Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: BedDouble,
      color: "#2563eb"
    },
    {
      title: "Available Rooms",
      value: stats.availableRooms,
      icon: CheckCircle,
      color: "#16a34a"
    },
    {
      title: "Occupied Rooms",
      value: stats.occupiedRooms,
      icon: Users,
      color: "#ea580c"
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings,
      icon: BedDouble,
      color: "#9333ea"
    },
    {
      title: "Revenue",
      value: `₹${Number(stats.revenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "#0891b2"
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome to Hotel Management System
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          style={styles.refreshButton}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={styles.message}>Loading dashboard data...</p>
      ) : (
        <>
          <div style={styles.grid}>
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div key={card.title} style={styles.card}>
                  <div
                    style={{
                      ...styles.iconBox,
                      backgroundColor: `${card.color}15`,
                      color: card.color
                    }}
                  >
                    <Icon size={25} />
                  </div>

                  <p style={styles.cardTitle}>{card.title}</p>

                  <h2 style={styles.cardValue}>
                    {card.value}
                  </h2>
                </div>
              );
            })}
          </div>

          <div style={styles.info}>
            <h2>Hotel Overview</h2>
            <p>
              Total Rooms: {stats.totalRooms}
            </p>
            <p>
              Available Rooms: {stats.availableRooms}
            </p>
            <p>
              Occupied Rooms: {stats.occupiedRooms}
            </p>
            <p>
              Active Bookings: {stats.activeBookings}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "28px",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "Arial, sans-serif"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "30px"
  },

  heading: {
    fontSize: "30px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0
  },

  subtitle: {
    color: "#64748b",
    marginTop: "8px"
  },

  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontSize: "14px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "20px"
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0"
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  cardTitle: {
    color: "#64748b",
    fontSize: "14px",
    marginTop: "20px"
  },

  cardValue: {
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: "700",
    margin: "8px 0 0"
  },

  info: {
    marginTop: "30px",
    padding: "25px",
    backgroundColor: "white",
    borderRadius: "14px",
    border: "1px solid #e2e8f0"
  },

  error: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "15px",
    marginBottom: "20px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "8px"
  },

  message: {
    padding: "30px",
    textAlign: "center",
    color: "#64748b"
  }
};
