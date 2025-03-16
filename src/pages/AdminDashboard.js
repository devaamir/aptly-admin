import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import Navbar from "../components/Navbar";

// Bind modal to app element for accessibility
Modal.setAppElement("#root");

const AdminDashboard = () => {
  const [hospitals, setHospitals] = useState([]);
  const [hospitalForm, setHospitalForm] = useState({ name: "", location: "" });
  const [isEditingHospital, setIsEditingHospital] = useState(false);
  const [viewingHospital, setViewingHospital] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    specialty: "",
    hospital: "",
    profileImage: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isEditingDoctor, setIsEditingDoctor] = useState(false);

  // Fetch hospitals on mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/hospitals", {
        headers: { "x-auth-token": token },
      });
      setHospitals(res.data);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    }
  };

  // Fetch doctors when viewing a hospital
  const fetchDoctors = async (hospitalId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/admin/doctors/${hospitalId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  // Handle hospital form submission
  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (isEditingHospital) {
        const res = await axios.put(
          `http://localhost:5000/api/admin/hospital/${hospitalForm._id}`,
          hospitalForm,
          { headers: { "x-auth-token": token } }
        );
        setHospitals(
          hospitals.map((h) => (h._id === res.data._id ? res.data : h))
        );
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/admin/hospital",
          hospitalForm,
          { headers: { "x-auth-token": token } }
        );
        setHospitals([...hospitals, res.data]);
      }
      setHospitalForm({ name: "", location: "" });
      setIsEditingHospital(false);
      setIsHospitalModalOpen(false);
    } catch (err) {
      alert(
        err.response?.data?.msg ||
          `Failed to ${isEditingHospital ? "update" : "create"} hospital`
      );
    }
  };

  // Handle doctor form submission
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (isEditingDoctor) {
        const res = await axios.put(
          `http://localhost:5000/api/admin/doctor/${doctorForm._id}`,
          doctorForm,
          { headers: { "x-auth-token": token } }
        );
        setDoctors(doctors.map((d) => (d._id === res.data._id ? res.data : d)));
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/admin/doctor",
          doctorForm,
          { headers: { "x-auth-token": token } }
        );
        setDoctors([...doctors, res.data]);
      }
      setDoctorForm({
        name: "",
        specialty: "",
        hospital: doctorForm.hospital,
        profileImage: "",
      });
      setIsEditingDoctor(false);
      setIsDoctorModalOpen(false);
    } catch (err) {
      alert(
        err.response?.data?.msg ||
          `Failed to ${isEditingDoctor ? "update" : "create"} doctor`
      );
    }
  };

  // Start editing hospital
  const handleEditHospital = (hospital) => {
    setHospitalForm(hospital);
    setIsEditingHospital(true);
    setViewingHospital(null);
    setIsHospitalModalOpen(true);
  };

  // Cancel hospital form
  const handleHospitalCancel = () => {
    setHospitalForm({ name: "", location: "" });
    setIsEditingHospital(false);
    setIsHospitalModalOpen(false);
  };

  // Delete hospital
  const handleDeleteHospital = async (id) => {
    if (window.confirm("Are you sure you want to delete this hospital?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/admin/hospital/${id}`, {
          headers: { "x-auth-token": token },
        });
        setHospitals(hospitals.filter((h) => h._id !== id));
        setViewingHospital(null);
        setDoctors([]);
      } catch (err) {
        alert(err.response?.data?.msg || "Failed to delete hospital");
      }
    }
  };

  // View hospital and fetch doctors
  const handleView = (hospital) => {
    const isSameHospital = viewingHospital?._id === hospital._id;
    setViewingHospital(isSameHospital ? null : hospital);
    setIsEditingHospital(false);
    if (!isSameHospital) {
      fetchDoctors(hospital._id);
      setDoctorForm({
        name: "",
        specialty: "",
        hospital: hospital._id,
        profileImage: "",
      });
    } else {
      setDoctors([]);
      setDoctorForm({
        name: "",
        specialty: "",
        hospital: "",
        profileImage: "",
      });
    }
  };

  // Start editing doctor
  const handleEditDoctor = (doctor) => {
    setDoctorForm(doctor);
    setIsEditingDoctor(true);
    setIsDoctorModalOpen(true);
  };

  // Delete doctor
  const handleDeleteDoctor = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/admin/doctor/${id}`, {
          headers: { "x-auth-token": token },
        });
        setDoctors(doctors.filter((d) => d._id !== id));
      } catch (err) {
        alert(err.response?.data?.msg || "Failed to delete doctor");
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>

        {/* Hospital List */}
        <div className="hospital-list">
          <div className="list-header">
            <h3>Hospitals</h3>
            <button onClick={() => setIsHospitalModalOpen(true)}>
              Add Hospital
            </button>
          </div>
          {hospitals.length === 0 ? (
            <p>No hospitals found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map((hospital) => (
                  <tr key={hospital._id}>
                    <td>{hospital.name}</td>
                    <td>{hospital.location}</td>
                    <td>
                      <button onClick={() => handleView(hospital)}>View</button>
                      <button onClick={() => handleEditHospital(hospital)}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHospital(hospital._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* View Hospital Details and Doctor Management */}
          {viewingHospital && (
            <div className="view-container">
              <h3>Hospital Details</h3>
              <p>
                <strong>Name:</strong> {viewingHospital.name}
              </p>
              <p>
                <strong>Location:</strong> {viewingHospital.location}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(viewingHospital.createdAt).toLocaleString()}
              </p>

              <button onClick={() => setIsDoctorModalOpen(true)}>
                Add Doctor
              </button>

              <h4>Doctors</h4>
              {doctors.length === 0 ? (
                <p>No doctors found for this hospital.</p>
              ) : (
                <div className="doctors-row">
                  {doctors.map((doctor) => (
                    <div key={doctor._id} className="doctor-card">
                      {doctor.profileImage && (
                        <img
                          src={doctor.profileImage}
                          alt={doctor.name}
                          className="doctor-image"
                        />
                      )}
                      <div className="doctor-info">
                        <p>
                          <strong>{doctor.name}</strong>
                        </p>
                        <p>{doctor.specialty}</p>
                        <div className="doctor-actions">
                          <button onClick={() => handleEditDoctor(doctor)}>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doctor._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setViewingHospital(null)}>Close</button>
            </div>
          )}
        </div>

        {/* Hospital Modal */}
        <Modal
          isOpen={isHospitalModalOpen}
          onRequestClose={() => setIsHospitalModalOpen(false)}
          className="modal"
          overlayClassName="modal-overlay"
        >
          <h2>
            {isEditingHospital ? "Update Hospital" : "Create New Hospital"}
          </h2>
          <form onSubmit={handleHospitalSubmit}>
            <div>
              <label>Hospital Name:</label>
              <input
                type="text"
                value={hospitalForm.name}
                onChange={(e) =>
                  setHospitalForm({ ...hospitalForm, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Location:</label>
              <input
                type="text"
                value={hospitalForm.location}
                onChange={(e) =>
                  setHospitalForm({ ...hospitalForm, location: e.target.value })
                }
                required
              />
            </div>
            <button type="submit">
              {isEditingHospital ? "Update" : "Create"} Hospital
            </button>
            <button type="button" onClick={handleHospitalCancel}>
              Cancel
            </button>
          </form>
        </Modal>

        {/* Doctor Modal */}
        <Modal
          isOpen={isDoctorModalOpen}
          onRequestClose={() => setIsDoctorModalOpen(false)}
          className="modal"
          overlayClassName="modal-overlay"
        >
          <h2>{isEditingDoctor ? "Update Doctor" : "Add Doctor"}</h2>
          <form onSubmit={handleDoctorSubmit}>
            <div>
              <label>Doctor Name:</label>
              <input
                type="text"
                value={doctorForm.name}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Specialty:</label>
              <input
                type="text"
                value={doctorForm.specialty}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, specialty: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Profile Image URL (optional):</label>
              <input
                type="text"
                value={doctorForm.profileImage}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, profileImage: e.target.value })
                }
              />
            </div>
            <button type="submit">
              {isEditingDoctor ? "Update" : "Add"} Doctor
            </button>
            <button type="button" onClick={() => setIsDoctorModalOpen(false)}>
              Cancel
            </button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
