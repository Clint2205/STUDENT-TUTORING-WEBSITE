<template>
  <DashboardLayout>
    <template #nav>
      <ParentNav />
    </template>

    <div class="wrap">

      <section class="card">

        <h2>Book Lesson</h2>

        <div class="field">
          <label>Select Child</label>

          <select
            v-model="selectedChildId"
            class="input"
          >
            <option value="">
              Select Child
            </option>

            <option
              v-for="c in children"
              :key="c._id"
              :value="c._id"
            >
              {{ c.childName || c.name }}
            </option>
          </select>
        </div>

        <div
          v-if="selectedChild"
          class="field"
        >
          <label>Select Tutor</label>

          <select
            v-model="bookingForm.tutorId"
            class="input"
          >
            <option value="">
              Select Tutor
            </option>

            <option
              v-for="t in selectedChild.tutorIds || []"
              :key="t._id"
              :value="t._id"
            >
              {{ t.name }}
            </option>
          </select>
        </div>

        <input
          type="datetime-local"
          v-model="bookingForm.startTime"
          class="input"
        />

        <input
          type="datetime-local"
          v-model="bookingForm.endTime"
          class="input"
        />

        <input
          v-model="bookingForm.subject"
          placeholder="Subject"
          class="input"
        />

        <textarea
          v-model="bookingForm.notes"
          placeholder="Notes"
          class="input"
        ></textarea>

        <button
          class="btn"
          @click="createBooking"
        >
          Request Booking
        </button>

      </section>

    </div>
  </DashboardLayout>
</template>

<script>
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout.vue";
import ParentNav from "../components/nav/ParentNav.vue";

export default {
  name: "ParentSchedule",

  components: {
    DashboardLayout,
    ParentNav
  },

  data() {
    return {
      children: [],
      selectedChildId: "",
      selectedChild: null,

      bookingForm: {
        tutorId: "",
        startTime: "",
        endTime: "",
        subject: "",
        notes: ""
      }
    };
  },

  watch: {
    selectedChildId(newId) {
      this.selectedChild =
        this.children.find(c => c._id === newId) || null;
    }
  },

  async created() {
    await this.loadChildren();
  },

  methods: {

    async loadChildren() {

      try {

        const res =
          await axios.get("/api/parent/children");

        this.children =
          res.data.children || [];

      } catch (e) {

        console.error(e);

      }

    },

    async createBooking() {

      if (!this.selectedChildId) {
        alert("Select child first");
        return;
      }

      try {

        await axios.post(
          "/api/booking",
          {
            ...this.bookingForm,
            studentId: this.selectedChildId
          }
        );

        alert("Booking requested ✅");

      } catch (e) {

        console.error(e);

        alert(
          e?.response?.data?.message ||
          "Booking failed"
        );

      }

    }

  }
};
</script>

<style scoped>
.wrap {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.input {
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.btn {
  margin-top: 20px;
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.field {
  margin-bottom: 14px;
}
</style>