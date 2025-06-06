# Smart Trash Routing System 🚛♻️

A sophisticated web application for optimizing waste collection routes using advanced algorithms and real-time data visualization. This system helps municipalities and waste management companies reduce operational costs, minimize environmental impact, and improve collection efficiency.

## 🌟 Features

### Core Functionality
- **Intelligent Route Optimization**: Uses Kruskal's algorithm for Minimum Spanning Tree (MST) generation
- **Dynamic Programming**: Optimizes bin visit sequences within clusters
- **Cluster Analysis**: Implements adapted Kadane's algorithm for bin clustering
- **Real-time Simulation**: Live updates of bin fill levels and route recalculation
- **Interactive Mapping**: Leaflet-based map with custom markers and route visualization
- **Predictive Analytics**: 24-hour fill level predictions for proactive planning

### Advanced Algorithms
- **Kruskal's Algorithm**: Finds minimum spanning tree for efficient city-wide connectivity
- **Dynamic Programming**: Solves the Traveling Salesman Problem for optimal bin sequences
- **Kadane's Algorithm (Adapted)**: Identifies high-density bin clusters
- **B+ Tree**: Efficient data storage and retrieval for large-scale bin management
- **Haversine Formula**: Accurate distance calculations between geographical points

### User Interface
- **Multi-tab Dashboard**: Organized views for different aspects of route management
- **Real-time Statistics**: Live metrics on routes, efficiency, and waste collection
- **Route Comparison**: Before/after analysis of optimization improvements
- **Interactive Controls**: Easy bin and truck management with form validation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: User preference-based theme switching

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.2.4**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Form management with validation
- **Zod**: Schema validation

### Mapping & Visualization
- **Leaflet**: Interactive maps
- **React Leaflet**: React integration for Leaflet
- **Recharts**: Data visualization and charts
- **Custom SVG Markers**: Priority-based bin visualization

### State Management & Data
- **React Hooks**: Local state management
- **B+ Tree**: Custom implementation for efficient data storage
- **Real-time Updates**: Simulation engine for dynamic data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/M-Sarim/SmartTrashRouting.git
   cd smarttrashrouting
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## 📊 How It Works

### 1. Data Input
- **Bins**: Add trash bins with location coordinates, fill levels, and capacity
- **Trucks**: Configure collection vehicles with capacity and current load
- **Interactive Map**: Click to place bins or use the input forms

### 2. Route Optimization Process

#### Step 1: Graph Creation
- Creates a complete graph where bins are nodes
- Calculates distances using the Haversine formula
- Generates edges between all bin pairs

#### Step 2: Minimum Spanning Tree (Kruskal's Algorithm)
- Sorts edges by distance (weight)
- Uses Disjoint Set Union (DSU) for cycle detection
- Builds MST for efficient city-wide connectivity

#### Step 3: Cluster Formation (Adapted Kadane's Algorithm)
- Groups bins based on density and fill levels
- Prioritizes high-fill bins (>80% capacity)
- Uses BFS for connected component identification

#### Step 4: Route Optimization (Dynamic Programming)
- Solves TSP for each cluster using DP with bitmasks
- Finds optimal visit sequences within clusters
- Minimizes total travel distance

#### Step 5: Truck Assignment
- Assigns optimized routes to available trucks
- Considers capacity constraints and current loads
- Prioritizes high-priority bins across all routes

### 3. Real-time Features
- **Live Simulation**: Automatic fill level updates
- **Route Recalculation**: Dynamic optimization as conditions change
- **Predictive Modeling**: 24-hour fill level forecasting
- **Performance Metrics**: Distance, waste collected, efficiency tracking

## 🎯 Key Algorithms Explained

### Kruskal's Algorithm
```typescript
// Finds Minimum Spanning Tree for city-wide optimization
export function runKruskalsAlgorithm(graph: Graph): Edge[]
```
- **Purpose**: Creates efficient road network representation
- **Complexity**: O(E log E) where E is number of edges
- **Benefit**: Reduces redundant connections between bins

### Dynamic Programming (TSP)
```typescript
// Optimizes bin visit sequence within clusters
export function optimizeRouteWithDP(cluster: Cluster, graph: Graph): number[]
```
- **Purpose**: Solves Traveling Salesman Problem for small clusters
- **Complexity**: O(n² × 2ⁿ) where n is cluster size
- **Benefit**: Guarantees optimal sequence for cluster traversal

### B+ Tree Implementation
```typescript
// Efficient data storage and retrieval
export class BPlusTree
```
- **Purpose**: Fast bin data access and range queries
- **Complexity**: O(log n) for search, insert, delete
- **Benefit**: Scales efficiently with large numbers of bins

## 📱 User Interface Guide

### Dashboard View
- **Statistics Cards**: Real-time metrics and KPIs
- **Control Panel**: Add bins, trucks, and trigger optimization
- **Simulation Controls**: Start/stop simulation, adjust speed
- **Quick Actions**: Load demo data, reset, export

### Map View
- **Interactive Map**: Click to add bins, view routes
- **Custom Markers**: Color-coded by fill level priority
- **Route Visualization**: Animated route display
- **MST Overlay**: Shows optimal city connectivity

### Routes View
- **Route Details**: Complete information for each truck route
- **Bin Sequences**: Ordered list of bins to visit
- **Performance Metrics**: Distance, waste collected, efficiency

### Visualization View
- **Algorithm Visualization**: Step-by-step optimization process
- **Network Graphs**: MST and cluster representations
- **Performance Charts**: Historical optimization data

### Comparison View
- **Before/After Analysis**: Route optimization improvements
- **Efficiency Metrics**: Distance reduction, time savings
- **Historical Trends**: Performance over time

## 🔧 Configuration

### Simulation Settings
- **Speed Control**: Adjust simulation update frequency
- **Auto-optimization**: Enable automatic route recalculation
- **Prediction Models**: Configure fill level forecasting

### Algorithm Parameters
- **B+ Tree Order**: Configurable for performance tuning
- **Cluster Density Threshold**: Adjust clustering sensitivity
- **Priority Thresholds**: Set fill level priorities

## 📈 Performance Metrics

The system tracks and displays:
- **Total Distance**: Cumulative route distances
- **Waste Collected**: Total waste pickup amounts
- **Route Efficiency**: Distance per unit of waste
- **High Priority Bins**: Bins requiring immediate attention
- **Optimization History**: Performance trends over time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Algorithms**: Implementation of classic computer science algorithms
- **Mapping**: Leaflet.js for interactive mapping capabilities
- **UI Components**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS for rapid UI development

## 📞 Support

For support, questions, or feature requests, please open an issue in the GitHub repository.

## 👨‍💻 Author

**Muhammad Sarim**

---

**Built with ❤️ for sustainable waste management and smart city solutions**
