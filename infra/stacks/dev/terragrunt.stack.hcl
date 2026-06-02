locals {
  hosted_zone_id = "Z08427401W2SCGIP77L8A"
  domain         = "dev.rx-refill-reminders.com"
}

unit "s3_website" {
  source = "${get_repo_root()}/infra/units/s3-website"
  path   = "s3-website"

  values = {
    bucket_name_prefix = "website"

    custom_domain = {
      hosted_zone_id  = local.hosted_zone_id
      domain_name     = local.domain
      certificate_arn = "arn:aws:acm:us-east-1:339284817422:certificate/f6d6bedd-a3f2-4cf3-92cc-d7a7ab2e6cf9"
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
