'use strict';

class TableBase {
  /**
   * @class
   * 
   * Table class with sort and pagination feature
   * 
   * Query names will need to be initialized as follows or other names:
   * ```
   * TableBase.queryName = {
   *   numPerPageName: "num_per_page",
   *   pageName: "page",
   *   sorter = {
   *     sort: "order",
   *     sort1: "order1",
   *     sort2: "order2"
   *   }
   * }
   * ```
   */
  constructor() {}

  /**
   * Instance method - Create table
   * 
   * @param {object} query Request url query
   * @param {string} originalUrl Original url path
   * @param {number} totalNoOfRow Total no. of row
   * @param {function} getTableDataFn Async function, which supports sort and pagination, to get table data
   * @returns {promise}
   */
  async create(query, originalUrl, totalNoOfRow, getTableDataFn) {   
    let sortFilter = this.getSortFilter(query);
    if (Object.entries(sortFilter).length === 0) { sortFilter = TableBase.defaultSortOrder; }

    let pagination = this.getPagination(totalNoOfRow, query, originalUrl);

    this.data = await getTableDataFn(sortFilter, { startIndex: pagination.startIndex, endIndex: pagination.endIndex });
    this.pagination = pagination;
    this.sorter = sortFilter;

    return Promise.resolve();
  }

  /**
   * Instance method - Get sort filter from url query
   * 
   * Note:
   * - default sort order is ascending if order is not provided at url parameter
   * - sorter can be customized by using TableBase.queryName.sorter variable declaration, e.g., TableBase.queryName.sorter = { sort: "order", sort1: "order1", sort2: "order2" }
   * 
   * @param {object} query Request url query
   * @returns {object} Sort filter
   */
  getSortFilter(query) {
    let sorter = {};
    for (let key in TableBase.queryName.sorter) {
      if (typeof query[key] !== "undefined") {
        sorter = { ...sorter, [query[key]]: query[TableBase.queryName.sorter[key]] === "desc" ? -1 : 1 };
      }
    }

    return sorter;
  }

  /**
   * Instance method - Get pagaination parameters from url path
   * 
   * @param {number} totalRow Total no. of row
   * @param {object} query Request url query
   * @param {string} originalUrl Original url path 
   * @returns {object} Pagination parameters
   */
  getPagination(totalRow, query, originalUrl) {
    let pageNum = Number(query[TableBase.queryName.pageName]);
    let rowPerPage = Number(query[TableBase.queryName.numPerPageName]);
    pageNum = isNaN(pageNum) ? 1 : pageNum;                           // if pageNum is not provided or invalid, set it to page 1
    rowPerPage = isNaN(rowPerPage) ? TableBase.defaultRowPerPage : rowPerPage;   // if rowPerPage is not provided or invalid, set it to default row per page
    let totalNumOfPage = Math.ceil(totalRow / rowPerPage);
    let [startIndex, endIndex] = [rowPerPage * (pageNum - 1) + 1, rowPerPage * pageNum];

    let baseUrl = originalUrl.replace(/\?.*$/, "");
    let params = originalUrl.match(/\?(.*)$/);
    if (params && params.length > 1) {
      params = new URLSearchParams(params[1]);

      if (!params.has("page")) { params.append("page", pageNum); }
      else { params.set("page", pageNum); }

      if (!params.has("num_per_page")) { params.append("num_per_page", rowPerPage); }
      else { params.set("num_per_page", rowPerPage); }
    }
    else {
      params = new URLSearchParams(`page=${pageNum}&num_per_page=${rowPerPage}`);
    }

    let page_url = `${baseUrl}?${params.toString()}`;

    let first_url, last_url, next_url, prev_url, urls_before_current = [], current_url, urls_after_current = [], dots_before_urls = false, dots_after_urls = false;
    if (totalNumOfPage > 1) {

      // Set current_url
      //
      current_url = {
        index: pageNum,
        url: page_url
      }

      // Set first_url and prev_url
      //
      if (pageNum > 1) {
        params.set("page", "1");
        first_url = `${baseUrl}?${params.toString()}`;

        params.set("page", pageNum - 1);
        prev_url = `${baseUrl}?${params.toString()}`;
      }
      
      // Set last_url and next_url
      //
      if (pageNum < totalNumOfPage) {
        params.set("page", totalNumOfPage);
        last_url = `${baseUrl}?${params.toString()}`;

        params.set("page", pageNum + 1);
        next_url = `${baseUrl}?${params.toString()}`;
      }

      // Set page urls between first and last page but current_url
      //
      let count = TableBase.numOfPaginatedPage;  // Number of paginated urls excluding current_url
      if (totalNumOfPage > 2) {
        let i = pageNum - 1, j = pageNum + 1;

        do {
          let hit = false;

          // Create the page before current page
          if (i > 1 && count > 0) {
            params.set("page", i);
            urls_before_current.unshift({ index: i, url: `${baseUrl}?${params.toString()}` });
            --i;
            --count;
            hit = true;
          }

          // Create the page after current page
          if (j < totalNumOfPage && count > 0) {
            params.set("page", j);
            urls_after_current.push({ index: j, url: `${baseUrl}?${params.toString()}` });
            ++j;
            --count;
            hit = true;
          }

          if (!hit) { --count; }
        } while (count > 0);
      }

      if (urls_before_current.length > 0 && urls_before_current[0].index > 2) { dots_before_urls = true; }
      if (urls_after_current.length > 0 && urls_after_current[urls_after_current.length - 1].index < totalNumOfPage - 1) { dots_after_urls = true; }
    }

    return {
      pageNum: pageNum,
      rowPerPage: rowPerPage,
      totalRow: totalRow,
      showItemOption: TableBase.showItemOption,
      totalNumOfPage: totalNumOfPage,
      startIndex: startIndex,
      endIndex: endIndex,
      page_url: page_url,
      current_url: current_url,
      dots_before_urls: dots_before_urls,
      dots_after_urls: dots_after_urls,
      urls_before_current: urls_before_current.length > 0 ? urls_before_current : undefined,
      urls_after_current: urls_after_current.length > 0 ? urls_after_current : undefined,
      prev_url: prev_url,
      last_url: last_url,
      first_url: first_url,
      next_url: next_url
    };
  }
}

module.exports = TableBase;