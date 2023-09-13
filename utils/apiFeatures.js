const organizeSearchFeilds = require("./organizeSearchFeilds");

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "searchValue",
      "skip",
    ];
    excludedFields.forEach((el) => delete queryObj[el]);
    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|or)\b/g,
      (match) => `$${match}`
    );
    queryStr = JSON.parse(queryStr);
    if (
      queryStr.$or &&
      this.queryString.searchValue &&
      this.queryString.searchValue.length > 0
    ) {
      queryStr.$or = organizeSearchFeilds(
        queryStr.$or,
        this.queryString.searchValue
      );
    } else {
      delete queryStr.$or;
    }

    this.query = this.query.find(queryStr);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort({ _id: 1 });

      // this.query.sort("-createdAt") || this.query.sort({ _id: 1 });
    }

    return this;
  }

  countDocs() {
    this.query = this.query.countDocuments();
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = this.queryString.skip || (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    console.log(skip, limit);
    return this;
  }
}
module.exports = APIFeatures;
