import matplotlib.pyplot as plt
import numpy as np

# Revenue projection data
months = np.arange(1, 37)  # 36 months (3 years)

# Scenario 1: Conservative Growth
featured_conservative = np.array([5, 8, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55] + [60 + i*5 for i in range(24)])
premium_conservative = np.array([1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16] + [18 + i*2 for i in range(24)])

# Scenario 2: Moderate Growth
featured_moderate = np.array([10, 18, 28, 40, 50, 60, 70, 80, 95, 110, 125, 140] + [155 + i*15 for i in range(24)])
premium_moderate = np.array([3, 6, 10, 15, 20, 25, 30, 35, 42, 50, 58, 66] + [74 + i*8 for i in range(24)])

# Scenario 3: Aggressive Growth
featured_aggressive = np.array([20, 40, 65, 95, 130, 170, 215, 265, 320, 380, 445, 515] + [590 + i*75 for i in range(24)])
premium_aggressive = np.array([5, 12, 22, 35, 52, 72, 95, 121, 150, 182, 217, 255] + [295 + i*40 for i in range(24)])

# Calculate monthly revenue
revenue_conservative = (featured_conservative * 35) + (premium_conservative * 99)
revenue_moderate = (featured_moderate * 35) + (premium_moderate * 99)
revenue_aggressive = (featured_aggressive * 35) + (premium_aggressive * 99)

# Create visualization
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))

# Plot 1: Monthly Revenue
ax1.plot(months, revenue_conservative, label='Conservative', linewidth=2, marker='o', markersize=3)
ax1.plot(months, revenue_moderate, label='Moderate', linewidth=2, marker='s', markersize=3)
ax1.plot(months, revenue_aggressive, label='Aggressive', linewidth=2, marker='^', markersize=3)
ax1.set_xlabel('Months', fontsize=12)
ax1.set_ylabel('Monthly Revenue ($)', fontsize=12)
ax1.set_title('Trail Match: Monthly Revenue Projections (3 Years)', fontsize=14, fontweight='bold')
ax1.legend(fontsize=10)
ax1.grid(True, alpha=0.3)
ax1.set_xlim(0, 37)

# Format y-axis as currency
ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))

# Plot 2: Cumulative Revenue
cumulative_conservative = np.cumsum(revenue_conservative)
cumulative_moderate = np.cumsum(revenue_moderate)
cumulative_aggressive = np.cumsum(revenue_aggressive)

ax2.plot(months, cumulative_conservative, label='Conservative', linewidth=2, marker='o', markersize=3)
ax2.plot(months, cumulative_moderate, label='Moderate', linewidth=2, marker='s', markersize=3)
ax2.plot(months, cumulative_aggressive, label='Aggressive', linewidth=2, marker='^', markersize=3)
ax2.set_xlabel('Months', fontsize=12)
ax2.set_ylabel('Cumulative Revenue ($)', fontsize=12)
ax2.set_title('Trail Match: Cumulative Revenue (3 Years)', fontsize=14, fontweight='bold')
ax2.legend(fontsize=10)
ax2.grid(True, alpha=0.3)
ax2.set_xlim(0, 37)

# Format y-axis as currency
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))

plt.tight_layout()
plt.savefig('/home/ubuntu/trail-match/revenue_projections.png', dpi=300, bbox_inches='tight')
print("Revenue projection chart saved!")

# Print summary statistics
print("\n=== REVENUE PROJECTION SUMMARY ===\n")

scenarios = {
    'Conservative': (revenue_conservative, featured_conservative, premium_conservative),
    'Moderate': (revenue_moderate, featured_moderate, premium_moderate),
    'Aggressive': (revenue_aggressive, featured_aggressive, premium_aggressive)
}

for name, (revenue, featured, premium) in scenarios.items():
    print(f"{name} Scenario:")
    print(f"  Year 1 Revenue: ${revenue[:12].sum():,.0f}")
    print(f"  Year 2 Revenue: ${revenue[12:24].sum():,.0f}")
    print(f"  Year 3 Revenue: ${revenue[24:36].sum():,.0f}")
    print(f"  Total 3-Year Revenue: ${revenue.sum():,.0f}")
    print(f"  Final Month: {featured[-1]} Featured + {premium[-1]} Premium = ${revenue[-1]:,.0f}/month")
    print()
