locals {
  hosted_zone_id = "Z07465232HRS85ZSQYRZY"
  domain         = "rx-refill-reminders.com"
}

unit "s3_website" {
  source = "${get_repo_root()}/infra/units/s3-website"
  path   = "s3-website"

  values = {
    bucket_name_prefix = "website"

    custom_domain = {
      hosted_zone_id  = local.hosted_zone_id
      domain_name     = local.domain
      certificate_arn = "arn:aws:acm:us-east-1:104875668206:certificate/481fc667-153a-4d14-8f9a-951e8a90cb36"
    }

    custom_error_responses = [
      {
        error_code            = 403
        response_code         = 200
        response_page_path    = "/index.html"
        error_caching_min_ttl = 0
      },
      {
        error_code            = 404
        response_code         = 200
        response_page_path    = "/index.html"
        error_caching_min_ttl = 0
      }
    ]
  }
}
