<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>Chart Visualization</h3>
      <div class="chart-info">
        <span class="chart-type">{{ chartType }}</span>
        <span class="data-count">{{ data.length }} data points</span>
      </div>
    </div>
    
    <div class="chart-content">
      <apexchart
        v-if="chartOptions && chartSeries"
        :options="chartOptions"
        :series="chartSeries"
        height="350"
        class="apex-chart"
      />
      <div v-else class="chart-loading">
        <div class="loading-spinner"></div>
        <p>Loading chart...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'


interface Props {
  data: Array<{ label: string; value: number | string }>
  type?: 'bar' | 'line' | 'area' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'auto'
})

// Chart options and series as reactive refs
const chartOptions = ref<any>(null)
const chartSeries = ref<any>(null)

// Computed properties
const chartType = computed(() => {
  if (props.type !== 'auto') return props.type
  
  if (props.data.length === 0) return 'bar'
  
  // Check if data looks like time-series (dates)
  const firstLabel = props.data[0]?.label
  if (firstLabel && isTimeSeriesData(firstLabel)) {
    return 'line' // Time-series data should be line chart
  }
  
  // For categorical data, use bar chart
  if (props.data.length <= 12) return 'bar'
  
  // For many data points, use line chart
  return 'line'
})

// Helper function to detect time-series data
const isTimeSeriesData = (label: string): boolean => {
  // Check for date patterns (YYYY-MM-DD, MM/DD/YYYY, etc.)
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    /^\d{1,2}-\d{1,2}-\d{4}$/, // M-D-YYYY
  ]
  
  return datePatterns.some(pattern => pattern.test(label))
}

// Format value for display


// Format date labels
const formatDateLabel = (label: string) => {
  const date = new Date(label)
  if (!isNaN(date.getTime())) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    
    if (year === new Date().getFullYear()) {
      return `${month}/${day}`
    } else {
      return `${month}/${day}/${year.toString().slice(-2)}`
    }
  }
  return label
}

// Create chart options based on type
const getChartOptions = () => {

  
  const baseOptions = {
    chart: {
      type: chartType.value,
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'],
    dataLabels: {
      enabled: true,
      style: {
        colors: ['var(--color-text-primary)']
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100]
      }
    },
    grid: {
      borderColor: 'var(--color-border)',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      categories: props.data.map(item => formatDateLabel(item.label)),
      labels: {
        style: {
          colors: 'var(--color-text-secondary)',
          fontSize: '12px'
        },
        rotate: -45,
        rotateAlways: false
      },
      axisBorder: {
        color: 'var(--color-border)'
      },
      axisTicks: {
        color: 'var(--color-border)'
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'var(--color-text-secondary)',
          fontSize: '12px'
        },
        formatter: (value: number) => value.toLocaleString()
      },
      axisBorder: {
        color: 'var(--color-border)'
      },
      axisTicks: {
        color: 'var(--color-border)'
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true,
        formatter: (value: any, { dataPointIndex }: any) => {
          return formatDateLabel(props.data[dataPointIndex]?.label || value)
        }
      },
      y: {
        formatter: (value: number) => value.toLocaleString()
      }
    },
    legend: {
      show: false
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          xaxis: {
            labels: {
              rotate: -90
            }
          }
        }
      }
    ]
  }

  // Add type-specific options
  if (chartType.value === 'area') {
    baseOptions.fill = {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100]
      }
    }
  }

  if (chartType.value === 'bar') {
    ;(baseOptions as any).plotOptions = {
      bar: {
        borderRadius: 4,
        columnWidth: '70%',
        distributed: false
      }
    }
  }

  return baseOptions
}

// Create chart data
const getChartData = () => {
  const series = [{
    name: 'Value',
    data: props.data.map(item => Number(item.value) || 0)
  }]

  return series
}

// Initialize chart
const initChart = () => {
  if (props.data.length === 0) return

  try {
    const options = getChartOptions()
    const series = getChartData()

    chartOptions.value = options
    chartSeries.value = series
  } catch (error) {
    console.error('Failed to initialize chart:', error)
    chartOptions.value = null
    chartSeries.value = null
  }
}

// Watch for data changes
watch(() => props.data, () => {
  nextTick(() => {
    initChart()
  })
}, { deep: true })

// Watch for type changes
watch(() => props.type, () => {
  nextTick(() => {
    initChart()
  })
})

// Initialize on mount
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  // Clean up reactive refs
  chartOptions.value = null
  chartSeries.value = null
})
</script>

<style scoped>
.chart-container {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.chart-header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.125rem;
  font-weight: 600;
}

.chart-info {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.chart-type {
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.data-count {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.chart-content {
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.apex-chart {
  width: 100%;
  height: 100%;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 350px;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-3);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: var(--space-2);
    align-items: flex-start;
  }
  
  .chart-content {
    min-height: 300px;
  }
}
</style>
