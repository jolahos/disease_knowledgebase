# Gene Expression Web Application

## Overview
This Flask web application provides an interface to explore gene expression data from the GTEx project and immune disease data. Users can view gene expression levels across different tissues, explore disease pathways, and retrieve gene information related to specific disease pathways.

This project was developed as part of my Master’s studies in Data Science for Life Sciences, specifically for the module Database. The aim of this project was to explore the integration of biological datasets, leveraging database management and analysis techniques to address key challenges in life sciences.

## Features
- View gene expression levels across different tissues
- Explore disease pathways
- Retrieve gene information related to specific disease pathways
- Interactive charts and tables

## Prerequisites
- Python 3.x
- Flask
- SQLAlchemy
- MySQL

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/jolahos/disease_knowledgebase.git
    ```
2. Navigate to the project directory:
    ```sh
    cd gene_expression_web
    ```
3. Set up a virtual environment:
    ```sh
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```
4. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```

## Configuration
1. Create a `.env` file in the root directory and add the necessary environment variables:
    ```env
    SQLALCHEMY_DATABASE_URI=mysql+pymysql://username:password@localhost/database_name
    SQLALCHEMY_TRACK_MODIFICATIONS=False
    ```

## Usage
1. Start the Flask application:
    ```sh
    flask run
    ```
2. Open your browser and navigate to `http://localhost:5000`.

## API Endpoints
- `GET /api/gene_expression/<gene_id>`: Retrieve gene expression data for a specific gene ID.
- `POST /api/gene_expression_data`: Retrieve average gene expression data for a specific gene ID.
- `GET /api/expression_count/<gene_id>`: Retrieve the number of rows per tissue for a specific gene ID.
- `POST /api/disease_pathway_data`: Retrieve gene information related to a specific disease pathway.
- `POST /api/gene_ids_for_pathway`: Retrieve gene IDs related to a specific disease pathway.

## Data Retrieval
To retrieve data, you can use the following URL format:
```html
http://localhost:5000/api/data?tissue=Liver&gene=CTLA4
change tissue and gene to your interest
```

## License
This project is licensed under the MIT License.

## Acknowledgments
This project uses data from the GTEx Project. Users must comply with the GTEx Data Use Agreement and acknowledge the GTEx project in any publications or presentations that use GTEx data.