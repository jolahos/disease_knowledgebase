"""
Project: Gene Expression Web Application
Description: This Flask web application provides an interface to explore gene expression data 
from the GTEx project and immune disease data. Users can view gene expression levels across 
different tissues, explore disease pathways, and retrieve gene information related to specific 
disease pathways.
"""

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# SQLAlchemy Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:1Xesdas11@localhost/immunology_disease_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Add model for the gtex_geneexpression table
class GTExGeneExpression(db.Model):
    __tablename__ = 'gtex_geneexpression'
    id = db.Column(db.Integer, primary_key=True)
    gene_id = db.Column(db.String, nullable=False)
    tissue = db.Column(db.String, nullable=False)
    expression_level = db.Column(db.Float, nullable=False)

# Add model for the immune_disease_data table
class ImmuneDiseaseData(db.Model):
    __tablename__ = 'immune_disease_data'
    id = db.Column(db.Integer, primary_key=True)
    Entry = db.Column(db.String, nullable=False)
    Disease_Pathway = db.Column(db.String, nullable=False)
    gene_id = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)

# Add model for the gene_info table
class GeneInfo(db.Model):
    __tablename__ = 'gene_info'
    Entry = db.Column(db.String, primary_key=True)
    gene_id = db.Column(db.String)
    description = db.Column(db.String)

# Create a route to render the page with the dropdown menu
@app.route('/')
def index():
    gene_ids = db.session.query(GeneInfo.gene_id).distinct().all()
    tissues = db.session.query(GTExGeneExpression.tissue).distinct().all()  # Query tissues from GTExGeneExpression table
    disease_pathways = db.session.query(ImmuneDiseaseData.Disease_Pathway).distinct().all()
    first_gene_id = gene_ids[0][0] if gene_ids else None
    return render_template('index.html', gene_ids=[gene_id[0] for gene_id in gene_ids], tissues=[tissue[0] for tissue in tissues], disease_pathways=[pathway[0] for pathway in disease_pathways], first_gene_id=first_gene_id)

# Create a route to handle the selection and display the average expression level
@app.route('/result', methods=['POST'])
def result():
    gene_id = request.form['gene_id']
    expression_data = db.session.query(GTExGeneExpression.tissue, db.func.avg(GTExGeneExpression.expression_level)).filter_by(gene_id=gene_id).group_by(GTExGeneExpression.tissue).all()
    return render_template('result.html', gene_id=gene_id, expression_data=expression_data)

# Create a new route to provide gene expression data as JSON
@app.route('/api/gene_expression/<gene_id>', methods=['GET'])
def get_gene_expression(gene_id):
    expression_data = db.session.query(GTExGeneExpression).filter_by(gene_id=gene_id).all()
    if not expression_data:
        return jsonify({"error": "Gene ID not found"}), 404
    result = [{"tissue": data.tissue, "expression_level": data.expression_level} for data in expression_data]
    return jsonify(result)

@app.route('/api/gene_expression_data', methods=['POST'])
def gene_expression_data():
    gene_id = request.json['gene_id']
    expression_data = db.session.query(GTExGeneExpression.tissue, db.func.avg(GTExGeneExpression.expression_level)).filter_by(gene_id=gene_id).group_by(GTExGeneExpression.tissue).all()
    result = [{"tissue": tissue, "expression_level": expression_level} for tissue, expression_level in expression_data]
    return jsonify(result)

# Create a new route to provide the number of rows per tissue as JSON
@app.route('/api/expression_count/<gene_id>', methods=['GET'])
def get_expression_count(gene_id):
    expression_count = db.session.query(GTExGeneExpression.tissue, db.func.count(GTExGeneExpression.id)).filter_by(gene_id=gene_id).group_by(GTExGeneExpression.tissue).all()
    result = [{"tissue": tissue, "count": count} for tissue, count in expression_count]
    return jsonify(result)

# Create a new route to provide disease pathway data as JSON
@app.route('/api/disease_pathway_data', methods=['POST'])
def get_disease_pathway_data():
    data = request.get_json()
    pathway = data.get('pathway')
    if not pathway:
        return jsonify([])

    results = db.session.query(GeneInfo.gene_id, GeneInfo.description).join(ImmuneDiseaseData, GeneInfo.Entry == ImmuneDiseaseData.Entry).filter(ImmuneDiseaseData.Disease_Pathway == pathway).all()
    return jsonify([{'gene_id': result.gene_id, 'description': result.description} for result in results])

@app.route('/api/gene_ids_for_pathway', methods=['POST'])
def get_gene_ids_for_pathway():
    data = request.get_json()
    pathway = data.get('pathway')
    if not pathway:
        return jsonify([])

    gene_ids = db.session.query(GeneInfo.gene_id).join(ImmuneDiseaseData, GeneInfo.Entry == ImmuneDiseaseData.Entry).filter(ImmuneDiseaseData.Disease_Pathway == pathway).filter(GeneInfo.gene_id.in_(db.session.query(GTExGeneExpression.gene_id).distinct())).distinct().order_by(GeneInfo.gene_id).all()
    return jsonify([gene_id[0] for gene_id in gene_ids])

if __name__ == '__main__':
    app.run(debug=True)

