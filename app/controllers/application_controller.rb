class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :set_gon

  private

  def set_gon
    gon.push(
      controller: params[:controller],
      action: params[:action],
      device: request.env['mobvious.device_type'].to_s,
      prerender: !params['_escaped_fragment_'].nil?,
      env: Rails.env.to_s,
      editable: !current_user.nil?,
      deletable: !current_user.nil? && current_user.role === 'admin'
    )
  end

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end

  def admin_user
    true if current_user && current_user.role == 'admin'
  end

  helper_method :current_user
end
