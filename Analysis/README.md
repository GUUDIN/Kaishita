# Guide for Installation and Execution of the Analysis

## Description

This analysis examines purchase data from a CSV file. It generates trend graphs for products and calculates purchase probabilities for each product and time period (morning, afternoon, and evening).

## Requirements

### Dependencies

- `pandas`
- `plotext`

To install the dependencies, use a virtual environment (recommended) or install them directly on the system.

### Virtual Environment (Recommended)

1. Create a virtual environment:

   ```bash
   python3 -m venv venv
   ```

2. Activate the virtual environment:

   - Linux/MacOS:
     ```bash
     source venv/bin/activate
     ```
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```

3. Install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```

## How to Run the Analysis

1. Ensure the virtual environment is activated (if you are using one).

2. Run the script:

   ```bash
   python analise_compras.py
   ```

3. Enter the full path to the CSV file when prompted. For example:

   ```plaintext
   Enter the full path to the CSV file: /path/to/your/file.csv
   ```

## CSV File Structure

The CSV file must contain the following columns:

| Column       | Description                     |
| ------------ | ------------------------------- |
| `data`       | Purchase date (YYYY-MM-DD)      |
| `hora`       | Purchase hour (0-24)            |
| `produto`    | Product name                    |
| `quantidade` | Quantity purchased              |

### Example CSV

```csv
data,hora,produto,quantidade
2024-01-01,8,KitKat,10
2024-01-01,14,Mentos,5
2024-01-01,20,Bala,7
2024-01-02,9,Pirulito,3
```

## Results

- **Trend Graphs**: Shows the total quantity of each product at different times of the day.
- **Purchase Probabilities**: Calculates the probability of purchasing each product during each time period (morning, afternoon, and evening).

