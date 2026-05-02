import matplotlib.pyplot as plt

months = ["Start", "M1", "M2", "M3", "M4", "M5", "M7"]
values = [0, 10000, 25000, 35000, 47000, 60000, 82000]

plt.figure()

plt.plot(months, values, marker='o')
plt.title("Return Accrual Over Time")
plt.xlabel("Time")
plt.ylabel("Return")

plt.grid()

plt.show()