// class APIFeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//   }

import mongoose from "mongoose";
import countryModel from "../../../db/models/country.model.js";

//   filter() {
//     const queryObj = { ...this.queryString };
//     const excludeFields = ["page", "sort", "limit", "fields", "search"];
//     excludeFields.forEach((el) => delete queryObj[el]);

//     let customQuery = {};

//     if (queryObj.addingFrom || queryObj.addingTo) {
//       let fromDate = queryObj.addingFrom ? new Date(queryObj.addingFrom) : null;
//       let toDate = queryObj.addingTo ? new Date(queryObj.addingTo) : null;

//       if (fromDate && isNaN(fromDate)) {
//         throw new Error("Invalid addingFrom date format");
//       }
//       if (toDate && isNaN(toDate)) {
//         throw new Error("Invalid addingTo date format");
//       }

//       if (fromDate && toDate && fromDate > toDate) {
//         [fromDate, toDate] = [toDate, fromDate];
//       }

//       if (fromDate) {
//         fromDate.setHours(0, 0, 0, 0);
//         customQuery.createdAt = { $gte: fromDate };
//       }
//       if (toDate) {
//         toDate.setHours(23, 59, 59, 999);
//         customQuery.createdAt = {
//           ...(customQuery.createdAt || {}),
//           $lte: toDate,
//         };
//       }

//       delete queryObj.addingFrom;
//       delete queryObj.addingTo;
//     }

//     // ✅ فلترة `subscriptionPaymentDate`
//     if (queryObj.startDate || queryObj.endDate) {
//       let startDate = queryObj.startDate ? new Date(queryObj.startDate) : null;
//       let endDate = queryObj.endDate ? new Date(queryObj.endDate) : null;

//       if (startDate && isNaN(startDate)) {
//         throw new Error("Invalid startDate format");
//       }
//       if (endDate && isNaN(endDate)) {
//         throw new Error("Invalid endDate format");
//       }

//       if (startDate && endDate && startDate > endDate) {
//         [startDate, endDate] = [endDate, startDate];
//       }

//       customQuery.subscriptionPaymentDate = {};
//       if (startDate) {
//         startDate.setHours(0, 0, 0, 0);
//         customQuery.subscriptionPaymentDate.$gte = startDate;
//       }
//       if (endDate) {
//         endDate.setHours(23, 59, 59, 999);
//         customQuery.subscriptionPaymentDate.$lte = endDate;
//       }

//       delete queryObj.startDate;
//       delete queryObj.endDate;
//     }

//     // ✅ فلترة حالة الاشتراك
//     if (queryObj.subscriptionStatus) {
//       customQuery.subscriptionStatus = queryObj.subscriptionStatus;
//     }

//     // ✅ فلترة الدولة
//     if (queryObj.country) {
//       customQuery.country = queryObj.country;
//     }

//     // دمج `customQuery` مع `queryObj`
//     Object.keys(queryObj).forEach((key) => {
//       customQuery[key] = queryObj[key];
//     });

//     // تطبيق الفلترة مباشرة
//     this.query = this.query.find(customQuery);
//     return this;
//   }

//   search() {
//     if (this.queryString.search && this.queryString.search.trim() !== "") {
//       const searchRegex = new RegExp(this.queryString.search, "i");
//       this.query = this.query.find({
//         $or: [
//           { name_ar: searchRegex },
//           { name_en: searchRegex },
//           { name: searchRegex },
//           { email: searchRegex },
//           { tenderNumber: searchRegex },
//           { phone: searchRegex },
//           { address: searchRegex },
//           { address_ar: searchRegex },
//           { address_en: searchRegex },
//         ],
//       });
//     }
//     return this;
//   }

//   sort() {
//     if (this.queryString.sort) {
//       const sortBy = this.queryString.sort.split(",").join(" ");
//       this.query = this.query.sort(sortBy);
//     } else {
//       this.query = this.query.sort("-createdAt");
//     }
//     return this;
//   }

//   limitFields() {
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(",").join(" ");
//       this.query = this.query.select(fields);
//     } else {
//       this.query = this.query.select("-__v -password");
//     }
//     return this;
//   }

//   paginate() {
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 10;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);
//     return this;
//   }
// }

// export default APIFeatures;
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields", "search"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let customQuery = {};

    if (queryObj.addingFrom || queryObj.addingTo) {
      let fromDate = queryObj.addingFrom ? new Date(queryObj.addingFrom) : null;
      let toDate = queryObj.addingTo ? new Date(queryObj.addingTo) : null;

      if (fromDate && isNaN(fromDate)) {
        throw new Error("Invalid addingFrom date format");
      }
      if (toDate && isNaN(toDate)) {
        throw new Error("Invalid addingTo date format");
      }

      if (fromDate && toDate && fromDate > toDate) {
        [fromDate, toDate] = [toDate, fromDate];
      }

      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        customQuery.createdAt = { $gte: fromDate };
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        customQuery.createdAt = {
          ...(customQuery.createdAt || {}),
          $lte: toDate,
        };
      }

      delete queryObj.addingFrom;
      delete queryObj.addingTo;
    }

    if (queryObj.startDate || queryObj.endDate) {
      let startDate = queryObj.startDate ? new Date(queryObj.startDate) : null;
      let endDate = queryObj.endDate ? new Date(queryObj.endDate) : null;

      if (startDate && isNaN(startDate)) {
        throw new Error("Invalid startDate format");
      }
      if (endDate && isNaN(endDate)) {
        throw new Error("Invalid endDate format");
      }

      if (startDate && endDate && startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }

      customQuery.subscriptionPaymentDate = {};
      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
        customQuery.subscriptionPaymentDate.$gte = startDate;
      }
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
        customQuery.subscriptionPaymentDate.$lte = endDate;
      }

      delete queryObj.startDate;
      delete queryObj.endDate;
    }

    if (queryObj.subscriptionStatus) {
      customQuery.subscriptionStatus = queryObj.subscriptionStatus;
    }

    // فلترة الدولة (countryIds)
    if (queryObj.countryIds) {
      const ids = Array.isArray(queryObj.countryIds)
        ? queryObj.countryIds
        : [queryObj.countryIds];

      const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

      customQuery.country = { $in: objectIds };
      delete queryObj.countryIds;
    }

    if (queryObj.subFieldId) {
      customQuery.subField = queryObj.subFieldId;
      delete queryObj.subFieldId;
    }
    if (queryObj.country) {
      customQuery.country = queryObj.country;
      delete queryObj.country;
    }
    // mainField
    if (queryObj.mainFieldId) {
      customQuery.mainField = queryObj.mainFieldId;
      delete queryObj.mainFieldId;
    }
    // mainAdvertiser
    if (queryObj.mainAdvertiser) {
      customQuery.mainAdvertiser = queryObj.mainAdvertiser;
      delete queryObj.mainAdvertiser;
    }
    // advertiser
    if (queryObj.advertiserId) {
      customQuery.advertiser = queryObj.advertiserId;
      delete queryObj.advertiserId;
    }

    Object.keys(queryObj).forEach((key) => {
      customQuery[key] = queryObj[key];
    });

    this.query = this.query.find(customQuery);
    return this;
  }

  async search() {
    if (this.queryString.search && this.queryString.search.trim() !== "") {
      const searchRegex = new RegExp(this.queryString.search, "i");

      // 🔥 نبحث على الدول
      const matchedCountries = await countryModel
        .find({
          $or: [
            { name_ar: searchRegex },
            { name_en: searchRegex },
            { name: searchRegex },
          ],
        })
        .select("_id");

      const countryIds = matchedCountries.map((country) => country._id);

      const searchConditions = [
        { name_ar: searchRegex },
        { name_en: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { tenderNumber: searchRegex },
        { phone: searchRegex },
        { address: searchRegex },
        { address_ar: searchRegex },
        { address_en: searchRegex },
      ];

      // 🔥 لو لقيت دول، ضيف شرط الدولة
      if (countryIds.length > 0) {
        searchConditions.push({ country: { $in: countryIds } });
      }

      this.query = this.query.find({
        $or: searchConditions,
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v -password");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
